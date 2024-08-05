import { fetchOrders, fetchSingleOrder } from '../api/fetchOrder';
import { editOrder } from '../api/editOrder';
import { getStockQuote } from '../api/getStockQuote';
import { login } from '../api/login';
import { lowHigh } from '../util/price';
import { quantDb } from './data';

//depreciated
export async function sellHigh() {
	const fetchOrder = await fetchOrders();
	for (const fetchO of fetchOrder.data) {
		if (
			fetchO.buyOrSell === 2 &&
			(fetchO.activeStatus !== 'COMPLETED' ||
				fetchO.activeStatus !== 'CANCELLED' ||
				fetchO.activeStatus !== 'REJECTED')
		) {
			const singleO = await fetchSingleOrder(fetchO.id);
			const order = singleO.data;
			const stockQuote = await getStockQuote(order.security.id);
      
			let ltp = stockQuote.data.payload.data[0].ltp;
			let lh = lowHigh(ltp);
			if (lh.high > order.orderBookExtensions[0].orderPrice) {
				order.orderBookExtensions[0].orderPrice = lh.high;
				order.orderBookExtensions[0].triggerPrice = 0;
				const { client, security, ...rest } = order;
				rest.client = {
					clientMemberCode: client.clientMemberCode,
					displayName: client.displayName,
					id: client.id,
					notsUniqueClientCode: client.notsUniqueClientCode
				};
				rest.security = {
					boardLotQuantity: security.boardLotQuantity,
					divisor: 100,
					exchangeSecurityId: security.exchangeSecurityId,
					id: security.id,
					marketProtectionPercentage: 0,
					tickSize: 1
				};
				const edit = await editOrder(rest);
				console.log(edit.data.message);
			}
		}
	}
}
