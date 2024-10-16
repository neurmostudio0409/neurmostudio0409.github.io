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
  
    let lastAcc = { x: 0, y: 0, z: 0 };
  
  if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function(event) {
          var accX = event.accelerationIncludingGravity.x;
          var accY = event.accelerationIncludingGravity.y;
          var accZ = event.accelerationIncludingGravity.z;
  
          // 使用平滑算法
          accX = (lastAcc.x + accX) / 2;
          accY = (lastAcc.y + accY) / 2;
          accZ = (lastAcc.z + accZ) / 2;
  
          lastAcc = { x: accX, y: accY, z: accZ };
  
          // 根據加速度數據調整相機位置
          var position = gpsCamera.getAttribute('position');
          
          // 更新相機位置的增量
          position.x += accX * 0.01; // 根據設備的朝向進行調整
          position.y += accY * 0.01;
          position.z += accZ * 0.01;
          gpsCamera.setAttribute('position', position);
      });
  }
  
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
  };
  