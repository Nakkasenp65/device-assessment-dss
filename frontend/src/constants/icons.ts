import {
  Smartphone,
  BatteryCharging,
  Wifi,
  Camera,
  Mic,
  Volume2,
  Power,
  Plug,
  Fingerprint,
  Box,
  CardSim,
  Bluetooth,
  Banknote,
  Store,
  ArrowRightLeft,
  Gift,
  Recycle,
  Trash2,
  HelpCircle,
} from "lucide-react";

export const CONDITION_ICONS = [
  { label: "Smartphone", value: "smartphone", component: Smartphone },
  { label: "Battery", value: "battery-charging", component: BatteryCharging },
  { label: "Wi-Fi", value: "wifi", component: Wifi },
  { label: "Camera", value: "camera", component: Camera },
  { label: "Microphone", value: "mic", component: Mic },
  { label: "Speaker", value: "volume-2", component: Volume2 },
  { label: "Power", value: "power", component: Power },
  { label: "Plug / Port", value: "plug", component: Plug },
  { label: "Fingerprint", value: "fingerprint", component: Fingerprint },
  { label: "Box / Housing", value: "box", component: Box },
  { label: "Sim Card", value: "sim-card", component: CardSim },
  { label: "Bluetooth", value: "bluetooth", component: Bluetooth },
];

export const PATH_ICONS = [
  { label: "Money / Sell", value: "banknote", component: Banknote },
  { label: "Store / Vendor", value: "store", component: Store },
  {
    label: "Exchange / Trade",
    value: "arrow-right-left",
    component: ArrowRightLeft,
  },
  { label: "Gift", value: "gift", component: Gift },
  { label: "Recycle", value: "recycle", component: Recycle },
  { label: "Trash", value: "trash-2", component: Trash2 },
];

export const getIconComponent = (name: string) => {
  // Normalize mapping (kebab-case to PascalCase for lookup if needed,
  // but here we just want to return the component associated with the value)
  const allIcons = [...CONDITION_ICONS, ...PATH_ICONS];
  const icon = allIcons.find((i) => i.value === name);
  return icon ? icon.component : HelpCircle;
};
