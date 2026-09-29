import Register from "./auth/register.js";
import Login from "./auth/login.js";
import AddReading from "./readings/add-reading.js";
import GetReadings from "./readings/get-readings.js";
import GetChartData from "./readings/get-chart-data.js";
import DeleteReading from "./readings/delete-reading.js";
import UpdateReading from "./readings/update-reading.js";

const apis = {
  Register,
  Login,
  AddReading,
  GetReadings,
  GetChartData,
  DeleteReading,
  UpdateReading,
} as const;

export default apis;

export type ApiRegistry = typeof apis;
