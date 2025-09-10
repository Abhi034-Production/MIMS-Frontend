import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import AdminLayout from "../../Components/AdminLayout";
import Spinner from "../../Components/Spinner";
import Seo from "../../Components/Seo";

const MyTrades = () => {
	const { user } = useContext(AuthContext);
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editId, setEditId] = useState(null);
	const [editData, setEditData] = useState({});
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!user?.email) return;
		setLoading(true);
		fetch(`https://mims-backend-x0i3.onrender.com/intraday-entries?userEmail=${user.email}`)
			.then(res => res.json())
			.then(data => {
				setEntries(data);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, [user]);

	const handleDelete = async (id) => {
		if (!window.confirm("Delete this entry?")) return;
		setMessage("");
		try {
			const res = await fetch(`https://mims-backend-x0i3.onrender.com/intraday-entry/${id}`, { method: "DELETE" });
			const data = await res.json();
			setEntries(entries.filter(e => e._id !== id));
			setMessage(data.message || "Deleted");
		} catch {
			setMessage("Delete failed");
		}
	};

	const handleEdit = (entry) => {
		setEditId(entry._id);
		setEditData(entry);
		setMessage("");
	};

	const handleEditChange = (e) => {
		const { name, value } = e.target;
		setEditData(prev => ({ ...prev, [name]: value }));
	};

	const handleEditSave = async (e) => {
		e.preventDefault();
		setMessage("");
		try {
			const res = await fetch(`https://mims-backend-x0i3.onrender.com/intraday-entry/${editId}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editData)
			});
			const updated = await res.json();
			setEntries(entries.map(e => e._id === editId ? updated : e));
			setEditId(null);
			setMessage("Updated successfully");
		} catch {
			setMessage("Update failed");
		}
	};

	if (loading) return <AdminLayout><div className="py-10 text-center"><Spinner /></div></AdminLayout>;

	return (
		<AdminLayout>


			<Seo
				title="My Trades | easyinventory"
				description="View and manage your intraday trade entries on easyinventory. Edit or delete your trade records with ease."
				keywords="intraday trades, trade entries, manage trades, edit trades, delete trades, easyinventory"
				url="https://easyinventory.online/my-trades"
			/>
			
			<div className="max-w-4xl mx-auto p-4">
				<h2 className="text-2xl font-bold mb-4">My Intraday Entries</h2>
				{message && <div className="mb-4 text-green-600">{message}</div>}
				{entries.length === 0 ? (
					<div className="text-center text-gray-500">No entries found.</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{entries.map(entry => (
							<div key={entry._id} className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mb-4 border border-gray-200 dark:border-gray-700">
								{editId === entry._id ? (
									<form onSubmit={handleEditSave} className="space-y-2">
										<div className="grid grid-cols-2 gap-2">
											<input name="date" value={editData.date} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Date" />
											<input name="day" value={editData.day} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Day" />
											<input name="overallProfitLoss" value={editData.overallProfitLoss} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Overall Profit/Loss" />
											<input name="netProfitLoss" value={editData.netProfitLoss} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Net Profit/Loss" />
											<input name="govCharges" value={editData.govCharges} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Gov Charges" />
											<input name="brokarage" value={editData.brokarage} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Brokarage" />
											<input name="totalTrade" value={editData.totalTrade} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Total Trade" />
											<input name="tradeType" value={editData.tradeType} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Trade Type" />
											<input name="tradeIndicators" value={editData.tradeIndicators} onChange={handleEditChange} className="border px-2 py-1 rounded" placeholder="Indicators" />
										</div>
										{/* Editable trade records */}
										{editData.tradeRecords && editData.tradeRecords.length > 0 && (
											<div className="mt-4">
												<div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Edit Trade Records:</div>
												<div className="overflow-x-auto">
													<table className="min-w-full text-xs border border-gray-200 dark:border-gray-700 rounded">
														<thead className="bg-gray-100 dark:bg-gray-700">
															<tr>
																<th className="px-2 py-2">Type</th>
																<th className="px-2 py-2">Stock Name</th>
																<th className="px-2 py-2">Qty</th>
																<th className="px-2 py-2">Profit/Loss</th>
															</tr>
														</thead>
														<tbody>
															{editData.tradeRecords.map((record, idx) => (
																<tr key={idx} className="border-t">
																	<td className="px-2 py-1">
																		<input
																			type="text"
																			value={record.tradeType}
																			onChange={e => {
																				const newRecords = [...editData.tradeRecords];
																				newRecords[idx].tradeType = e.target.value;
																				setEditData(prev => ({ ...prev, tradeRecords: newRecords }));
																			}}
																			className="border px-1 py-0.5 rounded w-full"
																		/>
																	</td>
																	<td className="px-2 py-1">
																		<input
																			type="text"
																			value={record.stockName}
																			onChange={e => {
																				const newRecords = [...editData.tradeRecords];
																				newRecords[idx].stockName = e.target.value;
																				setEditData(prev => ({ ...prev, tradeRecords: newRecords }));
																			}}
																			className="border px-1 py-0.5 rounded w-full"
																		/>
																	</td>
																	<td className="px-2 py-1">
																		<input
																			type="number"
																			value={record.stockQty}
																			onChange={e => {
																				const newRecords = [...editData.tradeRecords];
																				newRecords[idx].stockQty = Number(e.target.value);
																				setEditData(prev => ({ ...prev, tradeRecords: newRecords }));
																			}}
																			className="border px-1 py-0.5 rounded w-full"
																		/>
																	</td>
																	<td className="px-2 py-1">
																		<input
																			type="number"
																			value={record.profitLoss}
																			onChange={e => {
																				const newRecords = [...editData.tradeRecords];
																				newRecords[idx].profitLoss = Number(e.target.value);
																				setEditData(prev => ({ ...prev, tradeRecords: newRecords }));
																			}}
																			className="border px-1 py-0.5 rounded w-full"
																		/>
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											</div>
										)}
										<div className="flex gap-2 mt-2">
											<button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">Save</button>
											<button type="button" onClick={() => setEditId(null)} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
										</div>
									</form>
								) : (
									<div>
										<div className="flex flex-wrap gap-4 mb-2">
											<div><span className="font-semibold">Date:</span> {entry.date}</div>
											<div><span className="font-semibold">Day:</span> {entry.day}</div>
											<div><span className="font-semibold">Overall P/L:</span> {entry.overallProfitLoss}</div>
											<div><span className="font-semibold">Net P/L:</span> {entry.netProfitLoss}</div>
											<div><span className="font-semibold">Gov Charges:</span> {entry.govCharges}</div>
											<div><span className="font-semibold">Brokarage:</span> {entry.brokarage}</div>
											<div><span className="font-semibold">Total Trade:</span> {entry.totalTrade}</div>
											<div><span className="font-semibold">Trade Type:</span> {entry.tradeType}</div>
											<div><span className="font-semibold">Indicators:</span> {entry.tradeIndicators}</div>
										</div>
										<div className="flex gap-2 mb-2">
											<button onClick={() => handleEdit(entry)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
											<button onClick={() => handleDelete(entry._id)} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Delete</button>
										</div>
									</div>
								)}
								{/* Trade Records Section */}
								{entry.tradeRecords && entry.tradeRecords.length > 0 && (
									<div className="mt-4">
										<div className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Trade Records:</div>
										<div className="overflow-x-auto">
											<table className="min-w-full text-xs border border-gray-200 dark:border-gray-700 rounded">
												<thead className="bg-gray-100 dark:bg-gray-700">
													<tr>
														<th className="px-2 py-2">Type</th>
														<th className="px-2 py-2">Stock Name</th>
														<th className="px-2 py-2">Qty</th>
														<th className="px-2 py-2">Profit/Loss</th>
													</tr>
												</thead>
												<tbody>
													{entry.tradeRecords.map((record, idx) => (
														<tr key={idx} className="border-t">
															<td className="px-2 py-1">{record.tradeType}</td>
															<td className="px-2 py-1">{record.stockName}</td>
															<td className="px-2 py-1">{record.stockQty}</td>
															<td className="px-2 py-1">{record.profitLoss}</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
};

export default MyTrades;
