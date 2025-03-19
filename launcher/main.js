const { app, BrowserWindow, ipcMain } = require('electron');
const https = require('https');
const { https: followHttps } = require('follow-redirects');  // Použití follow-redirects pro sledování přesměrování
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');  // Knihovna pro rozbalování ZIP souborů
const { version } = require('os');

const versionFilePath = path.join(__dirname, 'version.txt');
const downloadPath = path.join(__dirname, 'game');

// Funkce pro kontrolu dostupné aktualizace na GitHubu
function checkForUpdates() {
    console.log('Kontroluji dostupné aktualizace...');
    const url = 'https://api.github.com/repos/qubas9/Slimer/releases/latest'; // Použijeme správného uživatele a repo

    https.get(url, { headers: { 'User-Agent': 'ElectronApp' } }, (response) => {
        let data = '';

        response.on('data', chunk => {
            data += chunk;
        });

        response.on('end', () => {
            const release = JSON.parse(data);
            const latestVersion = release.tag_name;
            const description = release.body;

            const currentVersion = getCurrentVersion();

            console.log(`Aktuální verze: ${currentVersion}, nejnovější verze: ${latestVersion}`);

            if (latestVersion !== currentVersion) {
                console.log('Dostupná nová verze. Zobrazuji informace o aktualizaci...');
                mainWindow.webContents.send('show-update-info', { latestVersion, description });
            } else {
                console.log('Verze jsou stejné. Hra je aktuální.');
                mainWindow.webContents.send('game-ready', 'Spusťte hru!');
            }
        });
    }).on('error', (err) => {
        console.error('Chyba při získávání dat z GitHubu:', err);
    });
}

// Funkce pro získání aktuální verze
function getCurrentVersion() {
    if (!fs.existsSync(versionFilePath)) {
        const initialVersion = 'v1.0.0';
        fs.writeFileSync(versionFilePath, initialVersion);
        console.log('Soubor version.txt neexistuje, vytvářím nový soubor s verzí: v1.0.0');
        return initialVersion;
    }
    return fs.readFileSync(versionFilePath, 'utf8').trim();
}

// Funkce pro stažení nové verze hry
function downloadNewVersion(latestVersion) {
    console.log(`Stahuji novou verzi ${latestVersion}...`);
    const url = `https://github.com/qubas9/Slimer/archive/refs/tags/${latestVersion}.zip`; // Opravený odkaz na stahování

    const file = fs.createWriteStream(path.join(downloadPath, 'game.zip'));

    // Používáme followHttps místo https
    followHttps.get(url, (response) => {
        console.log('Stahování probíhá...', response.statusCode);

        if (response.statusCode === 302) {
            console.log('Přesměrování detekováno...');
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close(() => {
                console.log('Stažení dokončeno. Rozbaluji hru...');
                extractGameFiles(latestVersion);  // Rozbalování souboru
            });
        });
    }).on('error', (err) => {
        console.error('Chyba při stahování nové verze:', err);
    });
}

// Funkce pro rozbalení ZIP souboru
function extractGameFiles(latestVersion) {
    try {

        const zip = new AdmZip(path.join(downloadPath, 'game.zip'));
        const extractPath = path.join(downloadPath, `Slimer`);

        console.log('Rozbaluji soubory...');
        zip.extractAllTo(extractPath, true);  // Rozbalí všechny soubory do složky podle verze

        console.log('Rozbalení dokončeno. Aktualizuji soubor version.txt...');
        updateVersion(latestVersion);  // Aktualizace verze v souboru version.txt
    } catch (err) {
        console.error('Chyba při rozbalování souboru:', err);
    }
}

// Funkce pro aktualizaci souboru version.txt
function updateVersion(latestVersion) {
    fs.writeFileSync(versionFilePath, latestVersion);  // Aktualizuje verzi v souboru version.txt
    console.log(`Soubor version.txt aktualizován na verzi: ${latestVersion}`);
    mainWindow.webContents.send('game-ready', 'Hra je připravena ke spuštění!');
}

// Funkce pro spuštění hry
function startGame() {
    console.log('Nscitam verzi...');
    const currentVersion = getCurrentVersion();
    console.log(`Aktuální verze hry je: ${currentVersion}`);
    console.log('Spouštím hru...');
    const gamePath = path.join(downloadPath, "Slimer",`Slimer-${currentVersion}`, 'index.html');

    // Načteme soubor index.html do hlavního okna
    mainWindow.loadFile(gamePath);
}


let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,  // Povolení integrace s Node.js
            contextIsolation: false // Povolení komunikace mezi hlavním a renderer procesem
        }
    });

    mainWindow.loadFile('index.html');
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Aplikace spuštěna, kontroluji aktualizace...');
        checkForUpdates();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Posluchač pro stáhnutí aktualizace
ipcMain.on('download-update', (event, latestVersion) => {
    console.log('Požadováno stažení aktualizace...');
    if (latestVersion === 'latest') {
        checkForUpdates();
    } else {
        downloadNewVersion(latestVersion);
    }
});

// Posluchač pro spuštění hry
ipcMain.on('start-game', () => {
    startGame();
});
