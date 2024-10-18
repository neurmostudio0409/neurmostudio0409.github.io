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

  buttonUp.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y += 0.1; // 每次點擊增加0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  buttonDown.addEventListener('click', (event) => {
    event.preventDefault();  // 阻止預設行為
    var position = gpsCamera.getAttribute('position');
    position.y -= 0.1; // 每次點擊減少0.1公尺
    gpsCamera.setAttribute('position', position);
  });

  // 切換模擬位置
  let isFirstLocation = true;
  switchButton.addEventListener('click', () => {
    if (isFirstLocation) {
      gpsCamera.setAttribute('gps-camera', 'simulateLatitude: 22.838301; simulateLongitude: 120.416253');
      isFirstLocation = false; // 切換到第二個位置
    } else {
      gpsCamera.setAttribute('gps-camera', 'simulateLatitude: 22.738301; simulateLongitude: 120.316253');
      isFirstLocation = true; // 切換回第一個位置
    }
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

      // 如果初始座標為 null，則設置初始座標
      if (initialCoordinates === null) {
        initialCoordinates = { latitude, longitude, altitude };
        coordinatesDiv.innerHTML = `Initial Coordinates set: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      } else {
        // 更新座標顯示
        coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
      }
    },
    (error) => {
      coordinatesDiv.innerHTML = `Error getting location: ${error.message}`;
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 2700 // 將 timeout 設為更低的數值
    }
  );

  let smoothAccX = 0;
  let smoothAccY = 0;
  let smoothAccZ = 0;

  const smoothingFactor = 0.1; // 可以根據需要調整

  window.addEventListener('devicemotion', function(event) {
    const accX = event.accelerationIncludingGravity.x;
    const accY = event.accelerationIncludingGravity.y;
    const accZ = event.accelerationIncludingGravity.z;

    // 平滑加速度數據
    smoothAccX = smoothAccX * (1 - smoothingFactor) + accX * smoothingFactor;
    smoothAccY = smoothAccY * (1 - smoothingFactor) + accY * smoothingFactor;
    smoothAccZ = smoothAccZ * (1 - smoothingFactor) + accZ * smoothingFactor;

    // 更新相機位置的邏輯...
  });

  const threshold = 0.05; // 根據需要調整閾值

  window.addEventListener('devicemotion', function(event) {
    const accX = event.accelerationIncludingGravity.x;
    const accY = event.accelerationIncludingGravity.y;
    const accZ = event.accelerationIncludingGravity.z;

    // 檢查加速度是否超過閾值
    if (Math.abs(accX) > threshold || Math.abs(accY) > threshold || Math.abs(accZ) > threshold) {
      // 更新相機位置的邏輯...
    }
  });

  gpsCamera.addEventListener('gps-camera-update-position', (event) => {
    const { longitude, latitude, altitude } = event.detail.position;

    if (latitude && longitude) {
      coordinatesDiv.innerHTML = `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}, Altitude: ${altitude ? altitude.toFixed(2) + ' meters' : 'Unavailable'}`;
    } else {
      coordinatesDiv.innerHTML = 'No GPS position data available!';
    }
  });

  gpsCamera.addEventListener('gps-camera-origin-coord-set', () => {
    coordinatesDiv.innerHTML = 'GPS signal initialized. Waiting for first position...';
  });

  gpsCamera.addEventListener('gps-camera-error', (event) => {
    coordinatesDiv.innerHTML = `Error: ${event.detail.error.message}`;
  });

  // 定期更新相機位置
  setInterval(() => {
    const cameraPosition = gpsCamera.object3D.position;
    cameraCoordinatesDiv.innerHTML = `Camera Position: X: ${cameraPosition.x.toFixed(2)}, Y: ${cameraPosition.y.toFixed(2)}, Z: ${cameraPosition.z.toFixed(2)}`;
  }, 100); // 每 100 毫秒更新一次

  AFRAME.registerComponent('adjust-height-on-plane', {
    init: function () {
      var model = document.querySelector('#Weapon');
      
      this.el.addEventListener('gps-entity-place-update-entity', function () {
        // 在 GPS 座標下顯示模型
        model.setAttribute('visible', 'true');
      });
      
      this.el.addEventListener('hit-test-start', function (event) {
        // 透過平面偵測調整模型的高度
        var intersection = event.detail.intersection;
        if (intersection && model.getAttribute('visible')) {
          var position = model.getAttribute('position');
          position.y = intersection.point.y;  // 調整 y 軸高度至平面
          model.setAttribute('position', position);
        }
      });
    }
  });

  // 啟動組件來監聽事件
  AFRAME.registerComponent('plane-detector', {
    init: function () {
      var sceneEl = this.el;
      sceneEl.addEventListener('loaded', function () {
        sceneEl.camera.el.setAttribute('adjust-height-on-plane', '');
      });
    }
  });
};

