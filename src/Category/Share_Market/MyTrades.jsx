import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../Context/AuthContext";
import AdminLayout from "../../Components/AdminLayout";
import Spinner from "../../Components/Spinner";

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
			<div className="max-w-4xl mx-auto p-4">
				<h2 className="text-2xl font-bold mb-4">My Intraday Entries</h2>
				{message && <div className="mb-4 text-green-600">{message}</div>}
				{entries.length === 0 ? (
					<div className="text-center text-gray-500">No entries found.</div>
				) : (
					<table className="w-full text-center text-[10px] xs:text-xs sm:text-sm md:text-base table-fixed break-words">
						<thead className="bg-gray-100 dark:bg-gray-700">
							<tr>
								<th className="px-1 py-2 sm:px-2 sm:py-4 dark:text-white whitespace-normal">Date</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Day</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Profit/Loss</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Net P/L</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Gov Charges</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Brokarage</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Total Trade</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Trade Type</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Indicators</th>
								<th className="px-1 py-2 sm:px-2 dark:text-white whitespace-normal">Actions</th>
							</tr>
						</thead>
						<tbody>
							{entries.map(entry => (
								editId === entry._id ? (
									<tr key={entry._id} className="bg-yellow-50 text-center border-b">
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="date" value={editData.date} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="day" value={editData.day} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="overallProfitLoss" value={editData.overallProfitLoss} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="netProfitLoss" value={editData.netProfitLoss} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="govCharges" value={editData.govCharges} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="brokarage" value={editData.brokarage} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="totalTrade" value={editData.totalTrade} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="tradeType" value={editData.tradeType} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words"><input name="tradeIndicators" value={editData.tradeIndicators} onChange={handleEditChange} className="border px-1" /></td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">
											<button onClick={handleEditSave} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
											<button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
										</td>
									</tr>
								) : (
									<tr key={entry._id} className="text-center border-b">
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.date}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.day}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.overallProfitLoss}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.netProfitLoss}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.govCharges}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.brokarage}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.totalTrade}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.tradeType}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">{entry.tradeIndicators}</td>
										<td className="py-1 px-1 sm:px-2 whitespace-normal break-words">
											<button onClick={() => handleEdit(entry)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
											<button onClick={() => handleDelete(entry._id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
										</td>
									</tr>
								)
							))}
						</tbody>
					</table>
				)}
			</div>
		</AdminLayout>
	);
};

export default MyTrades;
