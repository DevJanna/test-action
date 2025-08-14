import fetch from 'node-fetch';

const SENSOR_API = 'https://tp25-api.deno.dev/api/mdata/sensor';

// Random theo khoảng, làm tròn 1 chữ số thập phân
function randomInRange(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 10) / 10;
}

(async () => {
  try {
    const sensors = await fetch(SENSOR_API).then(res => res.json());

    if (!Array.isArray(sensors) || sensors.length === 0) {
      throw new Error('Không lấy được danh sách sensor');
    }

    const today = new Date();
    const day = today.getDate();
    const skipIndex = day % 2 === 0 ? 0 : 1;

    console.log(`Ngày ${day} → bỏ sensor index ${skipIndex}`);

    for (let i = 0; i < sensors.length; i++) {
      if (i === skipIndex) continue;

      const sensor = sensors[i];

      let value;
      if (sensor.code === 'Mux1_1_MTJ25_mm') {
        value = randomInRange(27, 28);
      } else if (sensor.code === 'WAD') {
        value = randomInRange(16, 16.5);
      } else if (sensor.code === 'WAU') {
        value = randomInRange(24, 24.5);
      } else {
        value = randomInRange(15, 16);
      }

      // Timestamp tính bằng giây
      const ts = Math.floor(today.getTime() / 1000);

      const payload = [[ts, value]];

      console.log(`📦 Sending data to ${sensor.code}:`, payload);

      try {
        const res = await fetch(`https://tp25-api.deno.dev/api/series/${sensor.code}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Lỗi ${res.status}: ${await res.text()}`);
        }

        console.log(`✅ Sent to ${sensor.code}: ${res.status}`);
      } catch (err) {
        console.error(`❌ Error sending to ${sensor.code}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi tạo dữ liệu mock:', error.message);
    process.exit(1);
  }
})();
