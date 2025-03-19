import {PermissionsAndroid, Platform} from "react-native";
import * as ExpoDevice from "expo-device";
import {useMemo, useState} from "react";
import {BleManager, Device} from "react-native-ble-plx";

interface BluetoothAPI {
    requestPermissions(): Promise<boolean>;

    scanForPeripherals(): void;

    devices: Device[{}];

    connectToDevice(): (device: Device) => Promise<void>;

    connectedDevice: Device | null;
}

const useBLE = () :BluetoothAPI => {
    const bleManager = useMemo(() => new BleManager(), []);
    // @ts-ignore
    const [devices, setAllDevices] = useState<Device[{}]>([{}]);
    const mockDevices = [
        {
            id: '1',
            name: 'vehicle 1',
            diagnostics: {
                battery_health: 85,
                fuel_level: 60,
                engine_status: 'ok',
                mileage: 5499,
            }
        },
        {
            id: '2',
            name: 'vehicle 2',
            diagnostics: {
                battery_health: 75,
                fuel_level: 80,
                engine_status: 'ok',
                mileage: 7200,

            }
        },
        {
            id: '3',
            name: 'vehicle 3',
            diagnostics: {
                battery_health: 50,
                fuel_level: 10,
                engine_status: 'check engine',
                mileage: 10000,
            }
        }
    ];
    const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
    const requestAndroid31Permissions = async () => {
        const bluetoothScanPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );
        const bluetoothConnectPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );
        const fineLocationPermission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message: "Bluetooth Low Energy requires Location",
                buttonPositive: "OK",
            }
        );

        return (
            bluetoothScanPermission === "granted" &&
            bluetoothConnectPermission === "granted" &&
            fineLocationPermission === "granted"
        );
    };
    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: "Location Permission",
                        message: "Bluetooth Low Energy requires Location",
                        buttonPositive: "OK",
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                return await requestAndroid31Permissions();
            }
        } else {
            return true;
        }
    };
    const scanForPeripherals = () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            console.log("=======================================================================?");
            if (error) {
                console.log(error);
            }
            setAllDevices(mockDevices)
        });
    }
    const connectToDevice = async (device: Device) => {
        try {
            const deviceConnection = await bleManager.connectToDevice(device.id);
            setConnectedDevice(deviceConnection);
            await deviceConnection.discoverAllServicesAndCharacteristics();
            await bleManager.stopDeviceScan();
        } catch (error) {
            console.log(error);
        }
    }
    return {
        scanForPeripherals,
        requestPermissions,
        devices,
        connectToDevice,
        connectedDevice,
    }
}
export default useBLE;