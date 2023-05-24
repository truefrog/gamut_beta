import transakSDK from "@transak/transak-sdk";

const settings = {
    apiKey: process.env.REACT_APP_TRANSAK_KEY,  // Your API Key
    environment: process.env.REACT_APP_MODE, // STAGING/PRODUCTION
    defaultCryptoCurrency: 'ETH',
    themeColor: '#000000', // App theme color
    hostURL: window.location.origin,
    widgetHeight: "80vh",
}

export function openTransak() {
    const transak = new transakSDK(settings);

    transak.init();

    // To get all the events
    transak.on(transak.ALL_EVENTS, (data) => {
        console.log(data)
    });

    // This will trigger when the user closed the widget
    transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, (eventData) => {
        console.log(eventData);
        transak.close();
    });

    // This will trigger when the user marks payment is made.
    transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, (orderData) => {
        console.log(orderData);
        window.alert("Payment Success")
        transak.close();
    });
}
