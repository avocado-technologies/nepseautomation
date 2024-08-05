// import { fetchOrders, fetchSingleOrder } from './api/fetchOrder';
// import { editOrder } from './api/editOrder';
// import { getStockQuote } from './api/getStockQuote';
import { login } from './api/login';
// import { lowHigh } from './util/price';
(async () => {
	// const response = await login();
	// let order = await placeOrder(response, 'AHPC');

    const kk = setInterval(async () => {  
        let d=  new Date().toLocaleTimeString();
        console.log(new Date().toLocaleTimeString())
        if(d>"7:48:40 PM"){
            console.log("order now");
            const response = await login();
            console.log("response",response)
            clearInterval(kk);
        }
    }, 1000);

	// let so = await sellOrder(response, 'HDL');
	// setInterval(async () => {
	// 	const fetchOrder = await fetchOrders(response);
	// 	for (const fetchO of fetchOrder.data) {
	// 		const singleO = await fetchSingleOrder(response, fetchO.id);
	// 		const order = singleO.data;
	// 		const stockQuote = await getStockQuote(response, order.security.id);
	// 		let ltp = stockQuote.data.payload.data[0].ltp;
	// 		let lh = lowHigh(ltp);
	// 		console.log(lh);
	// 		if (lh.high != order.orderBookExtensions[0].orderPrice) {
	// 			order.orderBookExtensions[0].orderPrice = lh.high;
	// 			order.orderBookExtensions[0].triggerPrice = 0;
	// 			const { client, security, ...rest } = order;
	// 			rest.client = {
	// 				clientMemberCode: client.clientMemberCode,
	// 				displayName: client.displayName,
	// 				id: client.id,
	// 				notsUniqueClientCode: client.notsUniqueClientCode
	// 			};
	// 			rest.security = {
	// 				boardLotQuantity: security.boardLotQuantity,
	// 				divisor: 100,
	// 				exchangeSecurityId: security.exchangeSecurityId,
	// 				id: security.id,
	// 				marketProtectionPercentage: 0,
	// 				tickSize: 1
	// 			};
	// 			const edit = await editOrder(response, rest);
	// 			console.log(edit.data.message);
	// 		}
	// 	}
	// }, 10000);
})();