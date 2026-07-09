# ⚡ ExvoGen

Fast Minecraft name generator with proxy support and real-time availability checks via the Mojang API.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## ✨ Features

- ⚡ **Fast** – Parallel name checking with proxy rotation.
- 🔍 **Real-time availability checks** – Verifies Minecraft usernames using the Mojang API.
- 🔀 **Proxy Support** – Automatically loads and tests proxies from `proxies.txt`.
- 🎨 **Clean UI** – Purple ASCII banner with colored console output.
- 📊 **Customizable** – Configure the number and length of generated names.
- 🎯 **Interactive** – Instantly select an available username.

---

## 📦 Installation

```bash
git clone https://github.com/zFixy/ExvoGen.git
cd ExvoGen
npm install
```

---

## 🚀 Usage

Run the generator:

```bash
node exvogen.js
```

### Using Proxies

Create a file named `proxies.txt` in the project directory.

Add one proxy per line:

```text
138.2.64.185:8118
172.237.73.24:80
8.215.25.3:2080
```

Then start the generator:

```bash
node exvogen.js
```

---

## ⚙️ Options

The program will ask you for:

- **How many names to generate** (1–1000)
- **Minimum length** (3–16)
- **Maximum length** (3–16)

---

## 🔧 Configuration

You can customize the settings inside `exvogen.js`:

```js
const CONFIG = {
    TIMEOUT: 3000,
    PARALLEL: 5,
    MAX_ATTEMPTS: 1000,
    RETRY_DELAY: 500,
    MAX_RETRIES: 1,
    PROXY_TEST_TIMEOUT: 2000
};
```

---

## 🛠️ How It Works

1. Loads proxies from `proxies.txt` (if available).
2. Tests all proxies and removes dead ones.
3. Generates random Minecraft usernames.
4. Checks availability through the Mojang API.
5. Displays the results with color-coded output.
6. Lets you choose an available username.

---

## 📋 Example Output

```text
   ███████╗██╗  ██╗██╗   ██╗ ██████╗
   ██╔════╝╚██╗██╔╝██║   ██║██╔═══██╗
   █████╗   ╚███╔╝ ██║   ██║██║   ██║
   ██╔══╝   ██╔██╗ ╚██╗ ██╔╝██║   ██║
   ███████╗██╔╝ ██╗ ╚████╔╝ ╚██████╔╝
   ╚══════╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝

How many names to generate? 10
Minimum length: 5
Maximum length: 8

Generating...

[1] Crafty   ✅ AVAILABLE
[2] Pixel_   ✅ AVAILABLE
[3] Notch    ❌ TAKEN
[4] Steve_   ❌ TAKEN

Available names:
1. Crafty
2. Pixel_
```

---

## 🌐 Getting Proxies

Some free proxy providers:

- https://proxyscrape.com/free-proxy-list
- https://openproxylist.xyz
- https://free-proxy-list.net

Proxy format:

```text
IP:PORT
```

Example:

```text
138.2.64.185:8118
172.237.73.24:80
```

---

## ⚠️ Notes

- Mojang API has rate limits. Using proxies helps distribute requests.
- Minecraft usernames can only be changed once every **30 days**.
- Free proxies may be slow or unreliable.
- For better performance, consider using premium proxies.

---

## 🛡️ Legal

This tool only checks Minecraft username availability using the official public Mojang API.

It **does not**:

- Hack Minecraft accounts
- Bypass Mojang security
- Steal accounts
- Violate Mojang's Terms of Service

---

## 🤝 Contributing

Pull requests and suggestions are welcome!

If you find a bug or have an idea for an improvement, feel free to open an issue.

---

## 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

<div align="center">

Made with ❤️ by **Exvo**

</div>