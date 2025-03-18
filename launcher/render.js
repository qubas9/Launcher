const { ipcRenderer } = require('electron');

// Posluchač pro kontrolu dostupnosti aktualizace
document.getElementById('check-update-btn').addEventListener('click', () => {
    console.log('Kontroluji dostupné aktualizace...');
    ipcRenderer.invoke('check-for-updates').then((updateInfo) => {
        if (updateInfo) {
            const { latestVersion, description } = updateInfo;
            console.log('Dostupná nová verze:', latestVersion);
            console.log('Popis aktualizace:', description);
            document.getElementById('update-info').innerHTML = `
                <h3>Nová verze k dispozici: ${latestVersion}</h3>
                <p>${description}</p>
                <button id="download-update">Stáhnout aktualizaci</button>
            `;
        } else {
            console.log('Aplikace je aktuální.');
            document.getElementById('update-info').innerHTML = '<p>Hra je aktuální!</p>';
        }
    }).catch((err) => {
        console.error('Chyba při kontrole aktualizace:', err);
    });
});

// Posluchač pro spuštění hry
document.getElementById('start-game-btn').addEventListener('click', () => {
    console.log('Spouštím hru...');
    // Přidej kód pro spuštění hry
});
