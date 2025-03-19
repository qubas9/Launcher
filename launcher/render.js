const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    console.log("renderer.js is running!");
    const updateInfoDiv = document.getElementById('update-info');
    const updateBtn = document.getElementById('update-btn');
    const startGameBtn = document.getElementById('start-game-btn');
    let latestVersion = "latest"; // Výchozí hodnota pro nejnovější verzi
    let description;

    ipcRenderer.on('show-update-info', (event, data) => {
        console.log('Přijato aktualizační info:', data);
        latestVersion = data.latestVersion;
        description = data.description;
        updateInfoDiv.innerHTML = `<strong>Nová verze: ${latestVersion}</strong><br>${description}`;
        updateBtn.style.display = 'block';
    });

    // Posluchač pro informování, že hra je aktuální
    ipcRenderer.on('game-ready', (event, message) => {
        console.log('Hra je aktuální:', message);
        updateInfoDiv.innerHTML = `<strong>Hra je aktuální!</strong> ${message}`;
        startGameBtn.disabled = false;
        updateBtn.style.display = 'none'; // Skryj tlačítko pro aktualizaci
    });

    // Po kliknutí na tlačítko pro stažení nové verze
    updateBtn.addEventListener('click', () => {
        console.log('Stahuji aktualizaci...',latestVersion);
        
        ipcRenderer.send('download-update', latestVersion);
        updateBtn.disabled = true;
        updateInfoDiv.innerHTML = 'Stahuji novou verzi...';
    });

    // Po kliknutí na tlačítko pro spuštění hry
    startGameBtn.addEventListener('click', () => {
        console.log('Spouštím hru...');
        ipcRenderer.send('start-game');
        startGameBtn.disabled = true;
        updateInfoDiv.innerHTML = 'Spouštím hru...';
    });

});
