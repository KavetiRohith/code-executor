const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Function to extract class name from the Java code
function extractClassName(javaCode) {
    const classNameMatch = javaCode.match(/public\s+class\s+(\w+)/);
    if (classNameMatch) {
        return classNameMatch[1]; // Return the class name (first capture group)
    }
    throw new Error('Invalid Java code: public class not found.');
}

// A function to execute the code
async function executeCode(language, code, stdin, expectedOutput) {
    const tempDir = './temp'; // Temporary folder for storing files
    await fs.mkdir(tempDir, { recursive: true });

    const filename = uuidv4();
    let extension = '';
    let compileCommand = '';
    let runCommand = '';
    let runArgs = [];
    const filePath = path.join(tempDir, `${filename}`);

    switch (language) {
        case 'python':
            extension = '.py';
            runCommand = 'python3';
            runArgs = [filePath + extension];
            break;
        case 'cpp':
            extension = '.cpp';
            compileCommand = 'g++';
            runCommand = path.join(tempDir, filename); // The compiled binary in temp dir
            runArgs = [];
            break;
        case 'java':
            // Extract class name from the code
            let className;
            try {
                className = extractClassName(code);
            } catch (err) {
                return { success: false, actualOutput: '', expectedOutput, error: err.message };
            }
            
            extension = '.java';
            compileCommand = 'javac';
            runCommand = 'java';
            runArgs = ['-cp', tempDir, filename]; // Run the Java class from temp dir
            break;
        default:
            throw new Error('Unsupported language');
    }

    // Write code to the file
    const sourceFilePath = filePath + extension;
    await fs.writeFile(sourceFilePath, code);

    // Compile (if required) and handle compilation errors
    if (language === 'cpp') {
        // Compile C++ code into the temp directory
        await compileCode(compileCommand, ['-o', path.join(tempDir, filename), sourceFilePath]);

        // Set executable permissions for the binary
        await fs.chmod(path.join(tempDir, filename), '755');
    } else if (language === 'java') {
        // Compile Java code into the temp directory
        await compileCode(compileCommand, ['-d', tempDir, sourceFilePath]);
    }

    // Run the program and capture output
    const output = await runProgram(runCommand, runArgs, stdin);

    // Compare output
    const isCorrect = output.trim() === expectedOutput.trim();
    await cleanupFiles(sourceFilePath, filePath); // Clean up temporary files

    return {
        success: isCorrect,
        actualOutput: output,
        expectedOutput,
        error: !isCorrect ? `Output did not match` : null
    };
}

// Helper function to run compilation commands
function compileCode(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let stderr = '';

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Compilation failed: ${stderr}`));
            }
            resolve();
        });
    });
}

// Helper function to run the code and capture stdout and stderr
function runProgram(command, args, stdin = '') {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args);
        let stdout = '';
        let stderr = '';

        if (stdin) {
            process.stdin.write(stdin);
        }
        process.stdin.end();

        process.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        process.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Execution failed with code ${code}: ${stderr}`));
            }
            resolve(stdout);
        });
    });
}

// Helper function to clean up temporary files
async function cleanupFiles(...filePaths) {
    for (const filePath of filePaths) {
        try {
            await fs.rm(filePath);
        } catch (err) {
            console.error(`Failed to delete file ${filePath}: ${err.message}`);
        }
    }
}

module.exports = { executeCode };
