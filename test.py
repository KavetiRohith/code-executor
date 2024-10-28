import requests

url = 'http://localhost:3000/execute'

requests_payloads = [
    {
        'language': 'python',
        'code': 'print("Hello, World!")',
        'stdin': '',
        'expectedOutput': 'Hello, World!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'python',
        'code': 'import time\ntime.sleep(10)\n',
        'stdin': '',
        'expectedOutput': '',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'python',
        'code': 'print("Hello, Python!")',
        'stdin': '',
        'expectedOutput': 'Hello, World!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'cpp',
        'code': '#include <iostream>\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
        'stdin': '',
        'expectedOutput': 'Hello, C++!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'cpp',
        'code': '#include <iostream>\nint main() {\n    std::cout << "Hello, C++!" << std::endl;\n    return 0;\n}',
        'stdin': '',
        'expectedOutput': 'Hello, C!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'cpp',
        'code': '#include <iostream>\nint add(int a, int b) {\n    return a + b;\n}\n',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'extern int add(int a, int b);\n\n#include <cxxtest/TestSuite.h>\n\nclass AddTestSuite : public CxxTest::TestSuite \n{\npublic:\n    void testAddPositiveNumbers() \n    {\n        TS_ASSERT_EQUALS(add(2, 3), 5);\n    }\n\n    void testAddNegativeNumbers() \n    {\n        TS_ASSERT_EQUALS(add(-1, 1), 0);\n    }\n};\n'
    },
    {
        'language': 'cpp',
        'code': '#include <iostream>\nint add(int a, int b) {\n    return a + b;\n}\n',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'extern int add(int a, int b);\n\n#include <cxxtest/TestSuite.h>\n\nclass AddTestSuite : public CxxTest::TestSuite \n{\npublic:\n    void testAddPositiveNumbers() \n    {\n        TS_ASSERT_EQUALS(add(2, 3), 5);\n    }\n\n    void testAddNegativeNumbers() \n    {\n        TS_ASSERT_EQUALS(add(-1, 0), 0); // Intentional failure\n    }\n};\n'
    },
    {
        'language': 'java',
        'code': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
        'stdin': '',
        'expectedOutput': 'Hello, World!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'java',
        'code': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}',
        'stdin': '',
        'expectedOutput': 'Hello, World!\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'java',
        'code': 'public class Main {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'import org.junit.Test;\nimport static org.junit.Assert.*;\n\npublic class MainTest {\n    @Test\n    public void testAdd() {\n        Main main = new Main();\n        assertEquals(5, main.add(2, 3));\n        assertEquals(0, main.add(-1, 1));\n    }\n}'
    },
    {
        'language': 'java',
        'code': 'public class Main {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'import org.junit.Test;\nimport static org.junit.Assert.*;\n\npublic class MainTest {\n    @Test\n    public void testAdd() {\n        Main main = new Main();\n        assertEquals(5, main.add(2, 3));\n        assertEquals(1, main.add(-1, 1)); // Intentional failure\n    }\n}'
    },
    {
        'language': 'python',
        'code': 'def add(a, b):\n    return a + b\n\nif __name__ == "__main__":\n    print(add(2, 3))',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'import pytest\nfrom program import add\n\ndef test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 0\n'
    },
    {
        'language': 'python',
        'code': 'def add(a, b):\n    return a + b\n\nif __name__ == "__main__":\n    print(add(2, 3))',
        'stdin': '',
        'expectedOutput': '',
        'runTests': True,
        'testCode': 'import pytest\nfrom program import add\n\ndef test_add():\n    assert add(2, 3) == 5\n    assert add(-1, 1) == 1  # Intentional failure\n'
    },
    {
        'language': 'python',
        'code': 'a = int(input())\nb = int(input())\nprint(a + b)',
        'stdin': '5\n10\n',
        'expectedOutput': '15\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'cpp',
        'code': '#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << (a + b) << endl;\n    return 0;\n}',
        'stdin': '5\n10\n',
        'expectedOutput': '15\n',
        'runTests': False,
        'testCode': ''
    },
    {
        'language': 'java',
        'code': 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        System.out.println(a + b);\n    }\n}',
        'stdin': '5\n10\n',
        'expectedOutput': '15\n',
        'runTests': False,
        'testCode': ''
    }
]

def send_request(payload):
    try:
        response = requests.post(url, json=payload)
        response_data = response.json()
        print(f"--- {payload['language']} Code Execution ---")
        print(f"Actual Output: {response_data.get('actualOutput', '')}")
        print(f"Expected Output: {payload.get('expectedOutput', '')}")
        if response_data.get('error'):
            print(f"Error: {response_data['error']}")
        print("\n")
    except Exception as e:
        print(f"Error sending request for {payload['language']}: {e}")

for payload in requests_payloads:
    send_request(payload)
