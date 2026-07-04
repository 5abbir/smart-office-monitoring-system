export type DeviceType = "FAN" | "LIGHT";
export type RoomId = "drawing_room" | "work_room_1" | "work_room_2";

export interface Device {
  id: string;            // e.g. "drawing_room-fan-1", "work_room_1-light-3"
  type: DeviceType;
  room: RoomId;
  label: string;         // e.g. "Fan 1", "Light 3" — human-facing
  status: "ON" | "OFF";
  wattage: number;       // 60 for fan-ON, 15 for light-ON, 0 if OFF
  lastChanged: string;   // ISO 8601 timestamp
}

export interface Alert {
  id: string;
  type: "AFTER_HOURS" | "ROOM_STAGNATION";
  room: RoomId;
  message: string;
  triggeredAt: string;   // ISO 8601
}
