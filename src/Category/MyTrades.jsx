import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import AdminLayout from "../Components/AdminLayout";
import Spinner from "../Components/Spinner";

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
		fetch(`http://localhost:3001/intraday-entries?userEmail=${user.email}`)
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
			const res = await fetch(`http://localhost:3001/intraday-entry/${id}`, { method: "DELETE" });
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
			const res = await fetch(`http://localhost:3001/intraday-entry/${editId}`, {
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
					<table className="w-full border text-sm">
						<thead>
							<tr className="bg-gray-100">
								<th>Date</th>
								<th>Day</th>
								<th>Profit/Loss</th>
								<th>Net P/L</th>
								<th>Gov Charges</th>
								<th>Brokarage</th>
								<th>Total Trade</th>
								<th>Trade Type</th>
								<th>Indicators</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{entries.map(entry => (
								editId === entry._id ? (
									<tr key={entry._id} className="bg-yellow-50">
										<td><input name="date" value={editData.date} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="day" value={editData.day} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="overallProfitLoss" value={editData.overallProfitLoss} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="netProfitLoss" value={editData.netProfitLoss} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="govCharges" value={editData.govCharges} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="brokarage" value={editData.brokarage} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="totalTrade" value={editData.totalTrade} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="tradeType" value={editData.tradeType} onChange={handleEditChange} className="border px-1" /></td>
										<td><input name="tradeIndicators" value={editData.tradeIndicators} onChange={handleEditChange} className="border px-1" /></td>
										<td>
											<button onClick={handleEditSave} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
											<button onClick={() => setEditId(null)} className="bg-gray-400 text-white px-2 py-1 rounded">Cancel</button>
										</td>
									</tr>
								) : (
									<tr key={entry._id}>
										<td>{entry.date}</td>
										<td>{entry.day}</td>
										<td>{entry.overallProfitLoss}</td>
										<td>{entry.netProfitLoss}</td>
										<td>{entry.govCharges}</td>
										<td>{entry.brokarage}</td>
										<td>{entry.totalTrade}</td>
										<td>{entry.tradeType}</td>
										<td>{entry.tradeIndicators}</td>
										<td>
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
