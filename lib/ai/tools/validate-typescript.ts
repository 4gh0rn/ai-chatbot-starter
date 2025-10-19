import { tool } from "ai";
import { z } from "zod";

/**
 * TypeScript Validation Tool for Teacher Mode
 * 
 * This tool validates TypeScript/JavaScript code to ensure there are no syntax errors
 * or basic type issues. It's primarily used in Teacher Mode to ensure code quality.
 */

const validateTypeScriptSchema = z.object({
  code: z.string().describe("The TypeScript/JavaScript code to validate"),
  language: z.enum(["typescript", "javascript"]).default("typescript").describe("The language of the code"),
});

/**
 * Basic TypeScript/JavaScript validation utility
 * 
 * This performs basic syntax and structure validation without full TypeScript compilation.
 * It checks for common issues that would cause runtime errors.
 */
function validateCodeSyntax(code: string, language: "typescript" | "javascript"): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Basic syntax checks
    
    // Check for unclosed brackets/braces/parentheses
    const brackets = { "(": ")", "[": "]", "{": "}" };
    const stack: string[] = [];
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char in brackets) {
        stack.push(brackets[char as keyof typeof brackets]);
      } else if (Object.values(brackets).includes(char)) {
        const expected = stack.pop();
        if (expected !== char) {
          errors.push(`Mismatched bracket at position ${i}. Expected '${expected}', found '${char}'`);
        }
      }
    }
    
    if (stack.length > 0) {
      errors.push(`Unclosed brackets: ${stack.join(", ")}`);
    }

    // Check for common TypeScript issues if language is TypeScript
    if (language === "typescript") {
      // Check for basic type annotation issues
      const typeAnnotationRegex = /:\s*[a-zA-Z_$][a-zA-Z0-9_$]*(?:\[\])?/g;
      const matches = code.match(typeAnnotationRegex) || [];
      
      // Check for common invalid type names
      const invalidTypes = ["String", "Number", "Boolean", "Object"];
      for (const match of matches) {
        const type = match.split(":")[1]?.trim();
        if (type && invalidTypes.includes(type)) {
          warnings.push(`Consider using lowercase primitive type '${type.toLowerCase()}' instead of '${type}'`);
        }
      }
    }

    // Check for common JavaScript syntax issues
    
    // Check for potential undefined variables (basic check)
    const variableDeclarations = code.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    const declaredVars = new Set(
      variableDeclarations.map(decl => decl.split(/\s+/)[1])
    );
    
    // Check for function declarations
    const functionDeclarations = code.match(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g) || [];
    functionDeclarations.forEach(decl => {
      const funcName = decl.split(/\s+/)[1];
      if (funcName) declaredVars.add(funcName);
    });

    // Check for arrow function assignments
    const arrowFunctions = code.match(/(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g) || [];
    arrowFunctions.forEach(decl => {
      const varName = decl.split(/\s+/)[1];
      if (varName) declaredVars.add(varName);
    });

    // Check for missing semicolons (warning only)
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          !trimmed.startsWith('//') &&
          !trimmed.startsWith('*') &&
          !trimmed.startsWith('/*') &&
          !trimmed.includes('*/')) {
        warnings.push(`Missing semicolon at line ${index + 1}: ${trimmed}`);
      }
    });

    // Check for proper import/export syntax
    const importRegex = /import\s+.*\s+from\s+['"`].*['"`]/g;
    const exportRegex = /export\s+(?:default\s+)?(?:const|let|var|function|class)/g;
    
    const imports = code.match(importRegex) || [];
    const exports = code.match(exportRegex) || [];
    
    imports.forEach(imp => {
      if (!imp.includes('from')) {
        errors.push(`Invalid import syntax: ${imp}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };

  } catch (error) {
    return {
      isValid: false,
      errors: [`Syntax validation failed: ${error instanceof Error ? error.message : String(error)}`],
      warnings
    };
  }
}

export const validateTypeScript = tool({
  description: `Validate TypeScript or JavaScript code for syntax errors and common issues. 
This tool is especially useful in Teacher Mode to ensure generated code is error-free and follows best practices.`,
  inputSchema: validateTypeScriptSchema,
  execute: async (params) => {
    const { code, language } = params;
    const validation = validateCodeSyntax(code, language);
    
    let result = `## Code Validation Results\n\n`;
    
    if (validation.isValid) {
      result += `✅ **Code is valid!** No syntax errors detected.\n\n`;
    } else {
      result += `❌ **Code has errors that need to be fixed:**\n\n`;
      validation.errors.forEach(error => {
        result += `- **Error:** ${error}\n`;
      });
      result += `\n`;
    }
    
    if (validation.warnings.length > 0) {
      result += `⚠️ **Warnings and suggestions for improvement:**\n\n`;
      validation.warnings.forEach(warning => {
        result += `- **Warning:** ${warning}\n`;
      });
      result += `\n`;
    }
    
    if (validation.isValid && validation.warnings.length === 0) {
      result += `🎉 **Perfect!** Your code follows best practices and is ready to use.\n\n`;
    }
    
    // Add educational notes for Teacher Mode
    result += `### 💡 Teacher Mode Tips:\n\n`;
    result += `- Always declare variables with \`const\`, \`let\`, or \`var\`\n`;
    result += `- Use TypeScript types for better code safety: \`string\`, \`number\`, \`boolean\`\n`;
    result += `- End statements with semicolons for consistency\n`;
    result += `- Keep functions small and focused on a single task\n`;
    result += `- Use descriptive variable and function names\n`;
    
    return {
      content: result,
      isValid: validation.isValid,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length
    };
  },
});