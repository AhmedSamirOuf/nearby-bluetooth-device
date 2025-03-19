import React, {useState} from 'react';
import {
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    View,
    ActivityIndicator,
    Text,
    Dimensions,
    SafeAreaView
} from 'react-native';
import useBLE from '../hooks/useBLE';
import axios from "axios";
import {BASE_URL} from "@/config";


const HomeScreen = () => {
    const [responseData, setResponseData] = useState('');
    const [loading, setLoading] = useState(false);
    const {
        scanForPeripherals,
        requestPermissions,
        devices,
        connectToDevice,
        connectedDevice
    } = useBLE();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDeviceConnecting, setIsDeviceConnecting] = useState({});
    const [connectedMessage, setConnectedMessage] = useState('');
    const scanForDevices = async () => {
        const isPermissionEnabled = await requestPermissions();
        if (isPermissionEnabled) {
            scanForPeripherals();
            setIsModalVisible(true);
        }
    }
    const mockConnectToDevice = async (device: object) => {
        console.log(device);
        connectToDevice(device);
        setIsDeviceConnecting(isDeviceConnecting => ({
            ...isDeviceConnecting,
            [device.id]: true
        }));
        setConnectedMessage('connected');
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/process-vehicle-data/`, device);
            setResponseData(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setTimeout(() => {
                setIsDeviceConnecting(false);
                setLoading(false);
                setIsModalVisible(false)
            }, 2000);
        }
    };


    const renderItem = ({item}) => (
        <TouchableOpacity style={styles.deviceItem} onPress={() => mockConnectToDevice(item)}>
            <Text style={styles.deviceName}>{item.name || 'Unnamed Device'}</Text>
            {isDeviceConnecting[String(item.id)] && loading && <ActivityIndicator size="small" color="#0000ff"/>}
        </TouchableOpacity>
    );
    const renderVehicleData = ({item}) => (
        <TouchableOpacity style={styles.deviceItem}>
            <Text style={styles.deviceName}>
                <Text style={styles.attributeLabel}>Model: </Text>
                <Text style={styles.attributeValue}>{item.model || 'Unnamed model'}</Text>
            </Text>
            <Text style={styles.deviceName}>
                <Text style={styles.attributeLabel}>Battery Health: </Text>
                <Text style={styles.attributeValue}>{item.battery_health}</Text>
            </Text>
            <Text style={styles.deviceName}>
                <Text style={styles.attributeLabel}>Mileage: </Text>
                <Text style={styles.attributeValue}>{item.mileage}</Text>
            </Text>
            <Text style={styles.deviceName}>
                <Text style={styles.attributeLabel}>Engine Status: </Text>
                <Text style={styles.attributeValue}>{item.engine_status}</Text>
            </Text>
            <Text style={styles.deviceName}>
                <Text style={styles.attributeLabel}>Fuel Level: </Text>
                <Text style={styles.attributeValue}>{item.fuel_level}</Text>
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {responseData && Object.keys(responseData).length > 0 &&!loading ?
                <FlatList data={[responseData]} renderItem={renderVehicleData} style={styles.connectedDevice}/> : null}
            <TouchableOpacity style={styles.scanButton} onPress={() => scanForDevices()}>
                <Text style={styles.scanButtonText}>Scan for nearby device</Text>
            </TouchableOpacity>
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsModalVisible(false)}
                        ><Text style={styles.closeButtonText}>Close</Text>
                            <Text style={styles.modalContainerTitle}>Tap on a device to select</Text>
                            <FlatList style={styles.list}
                                      data={devices}
                                      renderItem={renderItem}
                                      keyExtractor={(item, index) => index.toString()}
                            /></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
const height = Dimensions.get('window').height;

export default HomeScreen;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    scanButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    connectedDevice: {
        fontSize: 20,
        alignSelf: 'center',
        height: height * .5
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        height: height * .5,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalContainerTitle: {
        fontSize: 20,
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deviceItem: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
        borderRadius: 10,
        width: 300,
    },
    attributeLabel: {
        fontSize: 16,
        color: '#666',
        fontWeight: 'bold',
    },
    attributeValue: {
        fontSize: 16,
        color: '#f81010',
    },
    closeButton: {
        padding: 5,
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    list: {
        borderRadius: 20,
        backgroundColor: '#007AFF',
    }
});