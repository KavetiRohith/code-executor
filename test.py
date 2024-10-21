import requests

url = 'http://localhost:3000/execute'

requests_payloads = [
    {
        'language': 'python',
        'code': """
a = int(input())
b = int(input())
print(a + b)
""",
        'stdin': '5\n10\n',
        'expectedOutput': '15\n'
    },
    {
        'language': 'cpp',
        'code': """
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << (a + b) << endl;
    return 0;
}
""",
        'stdin': '5\n10\n',
        'expectedOutput': '15\n'
    },
    {
        'language': 'java',
        'code': """
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(a + b);
    }
}
""",
        'stdin': '5\n10\n',
        'expectedOutput': '15\n'
    }
]

def send_request(payload):
    try:
        response = requests.post(url, json=payload)
        response_data = response.json()
        print(f"--- {payload['language']} Code Execution ---")
        print(f"Success: {response_data['success']}")
        print(f"Actual Output: {response_data['actualOutput']}")
        print(f"Expected Output: {response_data['expectedOutput']}")
        if response_data['error']:
            print(f"Error: {response_data['error']}")
        print("\n")
    except Exception as e:
        print(f"Error sending request for {payload['language']}: {e}")

for payload in requests_payloads:
    send_request(payload)
