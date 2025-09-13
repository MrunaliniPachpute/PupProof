const { SerialPort } = require("serialport");

const port = new SerialPort({
  path: "COM4", 
  baudRate: 9600,
  autoOpen: true, 
});

port.on("open", () => {
  console.log("Serial port COM4 opened successfully!");
});
port.on("error", (err) => {
  console.error("Serial port error:", err.message);
});


function feedDog(duration) {
  if (!port.writable) {
    console.error("Serial port not ready!");
    return;
  }
  console.log(`Sending feed command: ${duration} to servo`);
  port.write(duration + "\n", (err) => {
    if (err) {
      console.error("Error on write:", err.message);
    } else {
      console.log("Command sent successfully");
    }
  });
}

module.exports = { feedDog };
