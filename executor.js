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

async function executeCode(language, code, stdin, expectedOutput) {
    const tempDir = './temp';
    const uniqueDir = path.join(tempDir, uuidv4()); 
    await fs.mkdir(uniqueDir, { recursive: true }); 

    let extension = '';
    let compileCommand = '';
    let runCommand = '';
    let runArgs = [];
    // for java
    let className = ''; 

    switch (language) {
        case 'python':
            extension = '.py';
            runCommand = 'python3';
            runArgs = [path.join(uniqueDir, `program${extension}`)];
            break;
        case 'cpp':
            extension = '.cpp';
            compileCommand = 'g++';
            runCommand = path.join(uniqueDir, 'program'); // The compiled binary in temp dir
            runArgs = [];
            break;
        case 'java':
            try {
                className = extractClassName(code); // extract class name for Java
            } catch (err) {
                await cleanupDir(uniqueDir);
                return { success: false, actualOutput: '', expectedOutput, error: err.message };
            }
            extension = '.java';
            compileCommand = 'javac';
            runCommand = 'java';
            runArgs = ['-cp', uniqueDir, className]; // run the Java class from temp dir
            break;
        default:
            await cleanupDir(uniqueDir);
            throw new Error('Unsupported language');
    }

    // dump code to the file
    const sourceFilePath = path.join(uniqueDir, `program${extension}`);
    await fs.writeFile(sourceFilePath, code);

    // compile (if required) and handle compilation errors
    if (language === 'cpp') {
        await compileCode(compileCommand, ['-o', path.join(uniqueDir, 'program'), sourceFilePath]);
        await fs.chmod(path.join(uniqueDir, 'program'), '755'); // Set executable permission
    } else if (language === 'java') {
        const javaFilePath = path.join(uniqueDir, `${className}${extension}`); // java file must match class name
        await fs.rename(sourceFilePath, javaFilePath); // rename file to class name
        await compileCode(compileCommand, ['-d', uniqueDir, javaFilePath]); // compile into temp dir
    }

    // run the program and capture output
    try {
        const output = await runProgram(runCommand, runArgs, stdin);
        const isCorrect = output.trim() === expectedOutput.trim();
        await cleanupDir(uniqueDir); // clean up temporary directory
        return {
            success: isCorrect,
            actualOutput: output,
            expectedOutput,
            error: !isCorrect ? `Output did not match` : null
        };
    } catch (err) {
        await cleanupDir(uniqueDir); // clean up even if there's an error
        return { success: false, actualOutput: '', expectedOutput, error: err.message };
    }
}

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

async function cleanupDir(dirPath) {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
    } catch (err) {
        console.error(`Failed to delete directory ${dirPath}: ${err.message}`);
    }
}

module.exports = { executeCode };
