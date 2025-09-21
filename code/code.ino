#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

#define  DHTPIN 33 
#define DHTTYPE DHT22 

DHT dht(DHTPIN, DHTTYPE); // Creating a dht object

#define LDR_PIN 26 //✅                    
#define SOIL_MOISTURE_PIN 27  //✅
#define TEMP_PIN 33 // ✅

#define LED_LIGHT 25 //yellow
#define LED_WATER 32 //green
#define LED_TEMP 14 //red  
#define BUZZER 12

const int dryValue = 4095; // Raw values of soil pin 
const int wetValue = 1800;
const int wetVal = 80; // conditions for soil
const int dryVal = 20;
const int heat = 32; // temperatuer 
const int cold = 15;
const int darkThreshold = 0;   // Calibrate val for ldr
const int sunnyThreshold = 600;
/*const int highLight = 0; // Raw reading from ldr
const int lowLight = 300;*/

int moisturePercent = 0;  
//int lightLux = 0;

float tempLow = 10.0;  
float tempHigh = 32.0; 

String lightCondition = "Smooth";

// ======================= WiFi & Supabase Config =======================
const char* ssid = "Android";           // 🔹 replace with your WiFi
const char* password = "12345678";   // 🔹 replace with your WiFi
String supabaseUrl = "https://rsmxdaycgyvniurkaqiz.supabase.co/rest/v1/userdata"; // 🔹 replace
String apiKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXhkYXljZ3l2bml1cmthcWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTAyMzcsImV4cCI6MjA2NzcyNjIzN30.kxM4exayLfVtwr3v1DuxiotkDDQDqMNQAStH-KOS_sE";       // 🔹 replace
// ======================================================================

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(LDR_PIN, INPUT);
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  pinMode(LED_LIGHT, OUTPUT);
  pinMode(LED_LIGHT, OUTPUT);
  pinMode(LED_WATER, OUTPUT);
  pinMode(LED_TEMP, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  // WiFi connect
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("\nConnected to WiFi!");
}

void loop() {
  int lightValue = analogRead(LDR_PIN);
  int soilValue = analogRead(SOIL_MOISTURE_PIN); //✅
  float tempRaw = dht.readTemperature();


    if (isnan(tempRaw)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(3000);
    return; // sometimes sensors like dht 22 return gabage value to validate it we use isnan
  }


  bool alert = false;


  moisturePercent = map(soilValue, dryValue, wetValue, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  if (moisturePercent > wetVal || moisturePercent < dryVal ){
    digitalWrite(LED_WATER , HIGH);
  }
  /*else if (moisturePercent < dryVal){
    digitalWrite(LED_WATER , HIGH);
  }*/
  else 
    digitalWrite(LED_WATER , LOW);



  if (lightValue == darkThreshold) {
    digitalWrite(LED_LIGHT, HIGH);
   
   lightCondition = "Too Dark"; // this string should be going to the web

  }
  else if (lightValue > sunnyThreshold){
    digitalWrite(LED_LIGHT, HIGH);

   lightCondition = "Too Sunny";

  }  
  else {
    digitalWrite(LED_LIGHT, LOW);

   lightCondition = "Smooth";

  }


  if (tempRaw > heat || tempRaw < cold ){
    digitalWrite(LED_TEMP , HIGH);

  }
  /*else if (tempRaw < cold){
    digitalWrite(LED_TEMP , HIGH);
  }*/

  else {
    digitalWrite(LED_TEMP , LOW);
  }

  if ( ((moisturePercent > wetVal) || (moisturePercent < dryVal)) && ((tempRaw > heat) || (tempRaw < cold)) && ((lightValue == darkThreshold) || (lightValue > sunnyThreshold)) ) {
    tone(BUZZER, 1000, 500);
  } 

  else {
    noTone(BUZZER);
  }

  // look this last this is display
  Serial.print(" | Light: "); Serial.print(lightValue); Serial.println( "|" + lightCondition);
  Serial.print(" | Temp: "); Serial.print(tempRaw); Serial.println(" °C");
  Serial.print(" | Soil: "); Serial.print(moisturePercent); Serial.println("%");
  Serial.print("\n");

  delay(3000);

  // ======================= Send Data to Supabase ======================
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(supabaseUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", apiKey);
    http.addHeader("Authorization", "Bearer " + apiKey);

    // JSON data
    String jsonData = "{";
    jsonData += "\"macaddress\":\"" + WiFi.macAddress() + "\",";
    jsonData += "\"temperature\": " + String((int)tempRaw) + ",";
    jsonData += "\"moisture\": " + String(moisturePercent);
    jsonData += "}";

    int httpResponseCode = http.POST(jsonData);

    if (httpResponseCode > 0) {
      Serial.println("✅ Data sent to Supabase!");
      Serial.println(http.getString()); // Supabase response
    } else {
      Serial.print("❌ Error sending data: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  } else {
    Serial.println("⚠️ WiFi Disconnected!");
  }
  // ====================================================================

  delay(3000);
}

// Temprature wire replaced ✅
// LDR connected ✅
// Temprature sensor is working ✅           
// next calibrate the soilmoisture ✅
//soil done now it's shows percentage ✅ 
// Check ldr ... ldr done 3.46 A.M ✅ 
// logic condition for buzzer cheking 4.07 A.M... Done 4.30 A.M ✅
// if ( ((moisturePercent > wetVal) || (moisturePercent < dryVal)) && ((tempRaw > heat) || (tempRaw < cold)) &&((lightValue == darkThreshold) || (lightValue > sunnyThreshold)) ) ✅ 
// Logic correct ✅ 
// Logic check using buzzer if all three elements are in a critical condtion buzzer working ✅ 4.50 A.M
// Change cold val 20 to 15 ✅
// change moisture percentage to 20% ✅
