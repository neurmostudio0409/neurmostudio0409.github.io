window.onload = function() {
  const coordinatesDiv = document.getElementById('coordinates');
  const cameraCoordinatesDiv = document.getElementById('camera-coordinates');
  const toggleButton = document.createElement('div');
  toggleButton.id = 'toggle-button';
  toggleButton.innerHTML = '→'; // 箭頭符號
  document.body.appendChild(toggleButton);

  let minimized = false;
  let initialCoordinates = null; // 存儲初始座標
  const gpsCamera = document.querySelector('[gps-camera]');
  const EARTH_RADIUS = 6371000; // 地球半徑（公尺）

  // 建立高度控制按鈕
  const heightControls = document.createElement('div');
  heightControls.id = 'height-controls';
  document.body.appendChild(heightControls);

  const buttonUp = document.createElement('button');
  buttonUp.className = 'height-button';
  buttonUp.innerHTML = '↑'; // 上升按鈕
  heightControls.appendChild(buttonUp);

  const buttonDown = document.createElement('button');
  buttonDown.className = 'height-button';
  buttonDown.innerHTML = '↓'; // 下降按鈕
  heightControls.appendChild(buttonDown);

  // 切換模擬經緯度的按鈕
  const switchButton = document.createElement('button');
  switchButton.id = 'switch-button';
  switchButton.innerHTML = '切換位置'; // 按鈕文字
  document.body.appendChild(switchButton);

  // 建立黑色全畫面漸出漸入效果
  const fadeOverlay = document.createElement('div');
  fadeOverlay.id = 'fade-overlay';
  document.body.appendChild(fadeOverlay);

  // 點擊上升按鈕
  buttonUp.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y += 0.1; // 每次點擊增加0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  // 點擊下降按鈕
  buttonDown.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y -= 0.1; // 每次點擊減少0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  // 切換模擬位置，並加入漸出漸入效果
  let isFirstLocation = true;
  switchButton.addEventListener('click', () => {
    // 漸入
    fadeOverlay.classList.add('fade-in');
    
    setTimeout(() => {
      // 切換 GPS 位置
      if (isFirstLocation) {
        gpsCamera.setAttribute('gps-camera', 'simulateLatitude: 22.838301; simulateLongitude: 120.416253');
        isFirstLocation = false;
      } else {
        gpsCamera.setAttribute('gps-camera', 'simulateLatitude: 22.738301; simulateLongitude: 120.316253');
        isFirstLocation = true;
      }

      // 漸出
      fadeOverlay.classList.remove('fade-in');
      fadeOverlay.classList.add('fade-out');
      
      // 移除漸出效果後將 visibility 隱藏
      setTimeout(() => {
        fadeOverlay.classList.remove('fade-out');
      }, 1000); // 1 秒後移除
    }, 1000); // 1 秒漸入動畫後進行位置切換
  });

  toggleButton.addEventListener('click', () => {
    minimized = !minimized;
    coordinatesDiv.classList.toggle('minimized', minimized);
    cameraCoordinatesDiv.classList.toggle('minimized', minimized);
    toggleButton.innerHTML = minimized ? '←' : '→';
    if (minimized) {
      toggleButton.style.top = '15px';
    } else {
      const coordinatesHeight = coordinatesDiv.offsetHeight;
      toggleButton.style.top = `${coordinatesHeight + 70}px`;
    }
  });

  if (!gpsCamera) {
    coordinatesDiv.innerHTML = 'GPS camera not found!';
    return;
  }

  navigator.geolocation.watchPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const altitude = position.coords.altitude;

      if (initialCoordinates === null) {
        initialCoordinates = { latitude, longitude, altitude };
        coordinatesDiv.innerHTML = `Initial Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      } else {
        coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      }
    },
    (error) => {
      coordinatesDiv.innerHTML = `Error getting location: ${error.message}`;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2700
    }
  );

  // 定期更新相機位置
  setInterval(() => {
    const cameraPosition = gpsCamera.object3D.position;
    cameraCoordinatesDiv.innerHTML = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;
  }, 100);
};