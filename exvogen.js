// name-generator.js
import fetch from 'node-fetch';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------- COLORS ----------
const PURPLE = '\x1b[38;5;141m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ---------- ASCII ART ----------
const ASCII_ART = `
${PURPLE}${BOLD}
   ███████╗██╗  ██╗██╗   ██╗ ██████╗ 
   ██╔════╝╚██╗██╔╝██║   ██║██╔═══██╗
   █████╗   ╚███╔╝ ██║   ██║██║   ██║
   ██╔══╝   ██╔██╗ ╚██╗ ██╔╝██║   ██║
   ███████╗██╔╝ ██╗ ╚████╔╝ ╚██████╔╝
   ╚══════╝╚═╝  ╚═╝  ╚═══╝   ╚═════╝ 
${RESET}`;

// ---------- SLEEP ----------
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ---------- READLINE ----------
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// ---------- MC LIMITS ----------
const MC_LIMITS = { MIN: 3, MAX: 16 };

// ---------- CONFIG ----------
const CONFIG = {
    TIMEOUT: 3000,           // Rychlejší timeout
    PARALLEL: 5,             // Více paralelních
    MAX_ATTEMPTS: 1000,
    RETRY_DELAY: 500,        // Rychlejší retry
    MAX_RETRIES: 1,          // Méně retry
    PROXY_TEST_TIMEOUT: 2000,
    PROXY_LIST: [],
    WORKING_PROXIES: []
};

// ---------- NAČTENÍ PROXY ----------
function loadProxiesFromFile() {
    try {
        const proxyFile = path.join(__dirname, 'proxies.txt');
        
        if (fs.existsSync(proxyFile)) {
            const content = fs.readFileSync(proxyFile, 'utf8');
            const proxies = content.split('\n')
                .map(line => line.trim())
                .filter(line => {
                    if (!line || line.startsWith('#') || line.includes('Free proxies') || line.includes('Updated at')) return false;
                    return /^\d+\.\d+\.\d+\.\d+:\d+$/.test(line);
                });
            
            if (proxies.length > 0) {
                CONFIG.PROXY_LIST.push(...proxies);
                return true;
            }
        }
        return false;
    } catch (error) {
        return false;
    }
}

// ---------- TESTOVÁNÍ PROXY (RYCHLÉ) ----------
async function testProxy(proxyUrl) {
    try {
        const startTime = Date.now();
        
        // Přidáme http:// pokud chybí
        if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('socks')) {
            proxyUrl = 'http://' + proxyUrl;
        }
        
        let agent;
        if (proxyUrl.startsWith('socks')) {
            agent = new SocksProxyAgent(proxyUrl);
        } else {
            agent = new HttpsProxyAgent(proxyUrl);
        }
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.PROXY_TEST_TIMEOUT);
        
        // Testujeme na rychlý endpoint
        const response = await fetch('https://api.mojang.com/users/profiles/minecraft/Notch', {
            method: 'HEAD',
            agent: agent,
            signal: controller.signal,
            timeout: CONFIG.PROXY_TEST_TIMEOUT
        });
        
        clearTimeout(timeout);
        
        const latency = Date.now() - startTime;
        
        // Proxy funguje pokud vrátí 200 nebo 429 (rate limit) nebo 404
        if (response.status === 200 || response.status === 404 || response.status === 429) {
            return { working: true, latency, proxy: proxyUrl };
        }
        
        return { working: false, proxy: proxyUrl };
        
    } catch (error) {
        return { working: false, proxy: proxyUrl, error: error.message };
    }
}

// ---------- TESTOVÁNÍ VŠECH PROXY (PARALELNĚ) ----------
async function testAllProxies(proxies) {
    console.log(`${CYAN}🔍 Testing ${proxies.length} proxies...${RESET}`);
    
    const batchSize = 20;
    const working = [];
    let tested = 0;
    
    for (let i = 0; i < proxies.length; i += batchSize) {
        const batch = proxies.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(p => testProxy(p)));
        
        for (const result of results) {
            tested++;
            if (result.working) {
                working.push(result.proxy);
                process.stdout.write(`${GREEN}.${RESET}`);
            } else {
                process.stdout.write(`${RED}.${RESET}`);
            }
        }
    }
    
    console.log(`\n${GREEN}✅ ${working.length} working proxies found${RESET}`);
    return working;
}

// ---------- GENERATE NAME ----------
function generateName(minLen, maxLen) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const all = letters + numbers + '_';
    
    const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
    let name = letters[Math.floor(Math.random() * letters.length)];
    
    for (let i = 1; i < length; i++) {
        name += all[Math.floor(Math.random() * all.length)];
    }
    
    return name;
}

// ---------- VYTVOŘENÍ FETCH S PROXY ----------
function createFetchWithProxy(proxyUrl) {
    if (!proxyUrl) return fetch;
    
    try {
        if (!proxyUrl.startsWith('http://') && !proxyUrl.startsWith('socks')) {
            proxyUrl = 'http://' + proxyUrl;
        }
        
        let agent;
        if (proxyUrl.startsWith('socks')) {
            agent = new SocksProxyAgent(proxyUrl);
        } else {
            agent = new HttpsProxyAgent(proxyUrl);
        }
        
        return (url, options = {}) => {
            return fetch(url, {
                ...options,
                agent: agent
            });
        };
    } catch (error) {
        return fetch;
    }
}

// ---------- CHECK VIA MOJANG API (RYCHLÉ) ----------
async function checkMojangAPI(username, proxyRotator = null) {
    try {
        let fetchFunc = fetch;
        let proxy = null;
        
        if (proxyRotator && CONFIG.WORKING_PROXIES.length > 0) {
            proxy = proxyRotator.getNextProxy();
            if (proxy) {
                fetchFunc = createFetchWithProxy(proxy);
            }
        }
        
        const url = `https://api.mojang.com/users/profiles/minecraft/${username}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        const response = await fetchFunc(url, {
            headers: { 
                'User-Agent': 'Mozilla/5.0'
            },
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        
        if (response.status === 429) {
            if (proxy) proxyRotator.markFailed(proxy);
            return { available: null, error: 'Rate limited' };
        }
        
        if (response.status === 200) {
            if (proxy) proxyRotator.markSuccess(proxy);
            return { available: false };
        }
        
        if (response.status === 204 || response.status === 404) {
            if (proxy) proxyRotator.markSuccess(proxy);
            return { available: true };
        }
        
        if (proxy) proxyRotator.markFailed(proxy);
        return { available: null, error: `HTTP ${response.status}` };
        
    } catch (error) {
        return { available: null, error: error.message || 'Failed' };
    }
}

// ---------- PROXY ROTATOR ----------
class ProxyRotator {
    constructor(proxies) {
        this.proxies = proxies;
        this.currentIndex = 0;
        this.failedProxies = new Set();
    }

    getNextProxy() {
        if (this.proxies.length === 0) return null;
        
        // Pokud máme málo proxy, prostě je rotujeme
        const proxy = this.proxies[this.currentIndex % this.proxies.length];
        this.currentIndex++;
        return proxy;
    }

    markFailed(proxy) {
        // Při chybě ho necháme na konci fronty
    }

    markSuccess(proxy) {
        // Úspěch - nic neděláme
    }
}

// ---------- GENEROVÁNÍ A KONTROLA ----------
async function generateNames(count, minLen, maxLen) {
    console.log(`\n${CYAN}📊 Generating ${count} names (${minLen}-${maxLen} chars)...${RESET}`);
    console.log(`${CYAN}⚡ Parallel: ${CONFIG.PARALLEL} checks at once${RESET}`);
    
    if (CONFIG.WORKING_PROXIES.length > 0) {
        console.log(`${CYAN}🔀 Using ${CONFIG.WORKING_PROXIES.length} working proxies${RESET}`);
    } else {
        console.log(`${YELLOW}⚠️ No proxies - using direct connection${RESET}`);
    }
    console.log('');
    
    const results = [];
    const used = new Set();
    let attempts = 0;
    let batch = [];
    let checked = 0;
    
    const startTime = Date.now();
    const proxyRotator = new ProxyRotator(CONFIG.WORKING_PROXIES);
    
    while (results.length < count && attempts < CONFIG.MAX_ATTEMPTS) {
        while (batch.length < CONFIG.PARALLEL && results.length + batch.length < count && attempts < CONFIG.MAX_ATTEMPTS) {
            attempts++;
            const name = generateName(minLen, maxLen);
            if (!used.has(name)) {
                used.add(name);
                batch.push(name);
            }
        }
        
        if (batch.length === 0) continue;
        
        const batchResults = await Promise.all(batch.map(name => checkMojangAPI(name, proxyRotator)));
        
        for (let i = 0; i < batchResults.length; i++) {
            checked++;
            const result = batchResults[i];
            const name = batch[i];
            
            let status;
            if (result.available === true) {
                status = `${GREEN}✅ FREE${RESET}`;
                results.push({ name, available: true });
            } else if (result.available === false) {
                status = `${RED}❌ TAKEN${RESET}`;
                results.push({ name, available: false });
            } else {
                status = `${YELLOW}❓ ${result.error || 'UNKNOWN'}${RESET}`;
                results.push({ name, available: null, error: result.error });
            }
            
            process.stdout.write(`  [${checked}] ${YELLOW}${name}${RESET} ... ${status}\n`);
        }
        
        batch = [];
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n${CYAN}⏱️  Done in ${duration}s${RESET}`);
    
    return results;
}

// ---------- SHOW INSTRUCTIONS ----------
function showChangeInstructions(name) {
    console.log(`\n${GREEN}✅ "${name}" is AVAILABLE!${RESET}`);
    console.log(`\n${BOLD}How to change your Minecraft name:${RESET}`);
    console.log(`  ${BOLD}1.${RESET} Go to ${PURPLE}https://www.minecraft.net${RESET}`);
    console.log(`  ${BOLD}2.${RESET} Login to your account`);
    console.log(`  ${BOLD}3.${RESET} Go to ${PURPLE}Profile → Name Change${RESET}`);
    console.log(`  ${BOLD}4.${RESET} Enter "${name}" and confirm`);
    console.log(`\n${YELLOW}⚠️  You can change your name once every 30 days!${RESET}\n`);
}

// ---------- MAIN ----------
async function main() {
    console.clear();
    console.log(ASCII_ART);
    console.log(`${PURPLE}${BOLD}  MINECRAFT NAME GENERATOR${RESET}`);
    console.log(`  ${PURPLE}Fast proxy rotation${RESET}\n`);
    
    // NAČTENÍ PROXY
    const hasProxies = loadProxiesFromFile();
    
    if (hasProxies) {
        // OTESTUJEME PROXY
        const working = await testAllProxies(CONFIG.PROXY_LIST);
        CONFIG.WORKING_PROXIES = working;
        
        if (working.length === 0) {
            console.log(`${YELLOW}⚠️  No working proxies found, using direct connection${RESET}\n`);
        }
    } else {
        console.log(`${YELLOW}⚠️  No proxies.txt found, using direct connection${RESET}\n`);
    }
    
    // ----- SETTINGS -----
    let count = 0;
    while (count < 1) {
        const answer = await question(`${BOLD}How many names to generate? ${RESET}`);
        count = parseInt(answer);
        if (isNaN(count) || count < 1) {
            console.log(`${RED}❌ Enter a valid number${RESET}\n`);
        }
    }
    
    let minLen = 0;
    while (minLen < MC_LIMITS.MIN || minLen > MC_LIMITS.MAX) {
        const answer = await question(`${BOLD}Minimum length (${MC_LIMITS.MIN}-${MC_LIMITS.MAX}): ${RESET}`);
        minLen = parseInt(answer);
        if (isNaN(minLen) || minLen < MC_LIMITS.MIN || minLen > MC_LIMITS.MAX) {
            console.log(`${RED}❌ Enter ${MC_LIMITS.MIN}-${MC_LIMITS.MAX}${RESET}\n`);
        }
    }
    
    let maxLen = 0;
    while (maxLen < minLen || maxLen > MC_LIMITS.MAX) {
        const answer = await question(`${BOLD}Maximum length (${minLen}-${MC_LIMITS.MAX}): ${RESET}`);
        maxLen = parseInt(answer);
        if (isNaN(maxLen) || maxLen < minLen || maxLen > MC_LIMITS.MAX) {
            console.log(`${RED}❌ Enter ${minLen}-${MC_LIMITS.MAX}${RESET}\n`);
        }
    }
    
    console.log(`\n${CYAN}⚡ Settings: ${count} names | ${minLen}-${maxLen} chars${RESET}`);
    console.log(`${CYAN}📝 Minecraft limits: ${MC_LIMITS.MIN}-${MC_LIMITS.MAX} chars${RESET}\n`);
    
    // ----- GENERATE -----
    const results = await generateNames(count, minLen, maxLen);
    
    // ----- SUMMARY -----
    const available = results.filter(r => r.available === true);
    const taken = results.filter(r => r.available === false);
    const unknown = results.filter(r => r.available === null);
    
    console.log('\n' + '═'.repeat(50));
    console.log(`${BOLD}📊 RESULTS${RESET}`);
    console.log('═'.repeat(50));
    console.log(`${GREEN}✅ FREE:     ${available.length}${RESET}`);
    console.log(`${RED}❌ TAKEN:    ${taken.length}${RESET}`);
    console.log(`${YELLOW}❓ UNKNOWN:  ${unknown.length}${RESET}`);
    
    if (available.length > 0) {
        console.log(`\n${GREEN}${BOLD}🎯 AVAILABLE NAMES:${RESET}`);
        available.forEach((r, i) => {
            console.log(`  ${GREEN}${String(i+1).padStart(2)}. ${r.name}${RESET}`);
        });
        
        const change = await question(`\n${BOLD}Change to one of these? (y/n): ${RESET}`);
        if (change.toLowerCase() === 'y') {
            let selected = 0;
            while (selected < 1 || selected > available.length) {
                const choice = await question(`${BOLD}Select number (1-${available.length}): ${RESET}`);
                selected = parseInt(choice);
                if (isNaN(selected) || selected < 1 || selected > available.length) {
                    console.log(`${RED}❌ Invalid${RESET}`);
                }
            }
            showChangeInstructions(available[selected - 1].name);
        }
    }
    
    console.log('\n' + '═'.repeat(50) + '\n');
    rl.close();
}

// ---------- RUN ----------
main().catch(error => {
    console.error(`${RED}❌ Error:${RESET}`, error.message);
    rl.close();
});