⚡ ExvoGen
Fast Minecraft name generator with proxy support and real availability check via Mojang API

https://img.shields.io/badge/version-1.0.0-purple
https://img.shields.io/badge/node-%253E%253D18.0.0-green
https://img.shields.io/badge/license-MIT-purple

✨ Features
⚡ Fast - Parallel checking with proxy rotation

🔍 Real verification - Checks availability via Mojang API

🔀 Proxy support - Auto-load and test proxies from proxies.txt

🎨 Beautiful UI - Purple ASCII art with colored output

📊 Customizable - Set name length and count

🎯 Interactive - Select and claim available names

📦 Installation
git clone https://github.com/zFixy/ExvoGen.git
cd ExvoGen
npm install
🚀 Usage
Basic usage

node exvogen.js
With proxies
Create proxies.txt in the project folder

Add one proxy per line:

138.2.64.185:8118
172.237.73.24:80
8.215.25.3:2080
Run the generator:

node exvogen.js
Options
The program will ask you:

How many names to generate? (1-1000)

Minimum length (3-16)

Maximum length (3-16)

🔧 Configuration
You can adjust settings in the CONFIG object inside exvogen.js:

const CONFIG = {
    TIMEOUT: 3000,
    PARALLEL: 5,
    MAX_ATTEMPTS: 1000,
    RETRY_DELAY: 500,
    MAX_RETRIES: 1,
    PROXY_TEST_TIMEOUT: 2000
};
🛠️ How it works
Loads proxies from proxies.txt (if exists)

Tests proxies - removes dead ones

Generates random names based on your settings

Checks availability via Mojang API

Shows results with color coding

Interactive selection - Choose and get instructions to claim

📋 Example Output

   ███████╗██╗  ██╗██╗   ██╗ ██████╗ 
   ██╔════╝╚██╗██╔╝██║   ██║██╔═══██╗
   █████╗   ╚███╔╝ ██║   ██║██║   ██║
   ██╔══╝   ██╔██╗ ╚██╗ ██╔╝██║   ██║
   ███████╗██╔╝ ██╗ ╚████╔╝ ╚██████╔╝
   ╚══════╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ 

╔═══════════════════════════════════════════╗
║   ⚡ EXVOGEN - MINECRAFT NAME GENERATOR ⚡   ║
║   Fast · Proxy Support · Real Checks        ║
╚═══════════════════════════════════════════╝

How many names to generate? 10
Minimum length (3-16): 5
Maximum length (5-16): 8

⚡ Settings: 10 names | 5-8 chars

📊 Generating 10 names...

  [1] Crafty ... ✅ FREE
  [2] Pixel_ ... ✅ FREE
  [3] Notch ... ❌ TAKEN
  [4] Steve_ ... ❌ TAKEN

══════════════════════════════════════════════
📊 RESULTS
══════════════════════════════════════════════
✅ FREE:     3
❌ TAKEN:    6
❓ UNKNOWN:  1

🎯 AVAILABLE NAMES:
   1. Crafty
   2. Pixel_
   3. NovaX

Change to one of these? (y/n): y
Select number (1-3): 2

✅ "Pixel_" is AVAILABLE!

How to change your Minecraft name:
  1. Go to https://www.minecraft.net
  2. Login to your account
  3. Go to Profile → Name Change
  4. Enter "Pixel_" and confirm

⚠️  You can change your name once every 30 days!

⚡ Thanks for using ExvoGen! ⚡
🔑 Getting Proxies
Free proxy sources
Free Proxy List

ProxyScrape

Open Proxy List

Format

IP:PORT
# Example:
138.2.64.185:8118
172.237.73.24:80
⚠️ Important Notes
Mojang API has rate limits. Using proxies helps distribute requests.

You can change your Minecraft name once every 30 days.

Free proxies may be slow or unreliable. Consider paid proxies for better performance.

🛡️ Legal
This tool only checks name availability via public APIs. It does not:

Hack or exploit Minecraft

Steal accounts

Violate Mojang's terms of service

🤝 Contributing
Contributions are welcome! Feel free to submit a Pull Request.

📄 License
MIT License - see LICENSE file for details.

Made with ❤️ by Exvo

