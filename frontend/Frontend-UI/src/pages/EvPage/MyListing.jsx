import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Package, DollarSign, Calendar, Edit2, Trash2,
    AlertCircle, Leaf, MapPin, Filter
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EvOwnerAPI from '../../api/EvOwnerAPI';
import Navbar from '../../Components/EVComponents/Navbar';
import Footer from '../../Components/Footer';

const MyListingsPage = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal States
    const [editingListing, setEditingListing] = useState(null); // Listing đang sửa
    const [newPrice, setNewPrice] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // ID listing đang muốn xóa
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchMyListings();
    }, []);

    const fetchMyListings = async () => {
        try {
            setLoading(true);
            const response = await EvOwnerAPI.marketplace.getMyListings();
            // Hỗ trợ cả cấu trúc Page hoặc List
            const data = response.data?.content || response.data?.data || [];
            setListings(data);
        } catch (err) {
            console.error('Failed to fetch listings:', err);
            setError('Unable to load your listings. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // --- Handle Update Price ---
    const openEditModal = (listing) => {
        setEditingListing(listing);
        setNewPrice(listing.price); // Load giá hiện tại
    };

    const handleUpdatePrice = async () => {
        if (!newPrice || parseFloat(newPrice) <= 0) {
            toast.error('Please enter a valid positive price');
            return;
        }

        try {
            setProcessing(true);
            await EvOwnerAPI.marketplace.updateListingPrice(editingListing.id, parseFloat(newPrice));

            // Update UI local state
            setListings(prev => prev.map(item =>
                item.id === editingListing.id ? { ...item, price: parseFloat(newPrice) } : item
            ));

            toast.success('Price updated successfully!');
            setEditingListing(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to update price');
        } finally {
            setProcessing(false);
        }
    };

    // --- Handle Cancel Listing ---
    const handleCancelListing = async (listingId) => {
        try {
            setProcessing(true);
            await EvOwnerAPI.marketplace.cancelListing(listingId);

            // Update UI: Chuyển trạng thái sang CANCELLED hoặc xóa khỏi list (tùy logic)
            // Ở đây ta load lại list để đồng bộ trạng thái mới nhất
            await fetchMyListings();

            toast.success('Listing cancelled successfully. Credits returned to your wallet.');
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to cancel listing');
        } finally {
            setProcessing(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING_TRANSACTION': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'CLOSED': return 'bg-blue-100 text-blue-700 border-blue-200'; // Sold
            case 'CANCELLED': return 'bg-red-50 text-red-500 border-red-100';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <>
            <Navbar />
            <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 9999 }}
            />
            <div className="min-h-screen bg-gray-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
                            <p className="text-gray-600 mt-1">Manage your active and past carbon credit sales</p>
                        </div>
                        <button
                            onClick={() => navigate('/ev-dashboard/listing')} // Link tới trang Create Listing
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
                        >
                            <Package size={18} /> Create New Listing
                        </button>
                    </div>

                    {/* Listings List */}
                    {listings.length === 0 ? (
                        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-12 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No listings yet</h3>
                            <p className="text-gray-500 mt-1">Start selling your carbon credits today</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {listings.map((listing) => (
                                <div key={listing.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">

                                    {/* Card Header */}
                                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(listing.status)}`}>
                          {listing.status.replace('_', ' ')}
                        </span>
                                                <span className="text-xs text-gray-500 font-mono">#{listing.id.substring(0, 8)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-2">
                                                <Calendar size={12} /> Posted {new Date(listing.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wider">Total Value</p>
                                            <p className="text-xl font-bold text-green-600">
                                                {/* ✅ Tính Tổng Giá = Giá đơn vị * Số lượng */}
                                                ${((listing.price || 0) * (listing.credit?.creditAmount || 0)).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-5">
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-blue-500" />
                                                    <span className="font-semibold text-gray-900">{listing.credit?.creditAmount} tonnes</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-500" />
                                                    <span className="font-semibold text-gray-900">${listing.price}/tonne</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">CO₂ Offset</p>
                                                <div className="flex items-center gap-2">
                                                    <Leaf className="w-4 h-4 text-green-600" />
                                                    {/* ✅ Tính CO2 = Credit * 1000 */}
                                                    <span className="font-semibold text-gray-900">{((listing.credit?.creditAmount || 0) * 1000).toLocaleString()} kg</span>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-700 truncate max-w-[120px]">
                            {listing.sellerLocation || 'Vietnam'}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Buttons (Only for ACTIVE listings) */}
                                        {listing.status === 'ACTIVE' ? (
                                            <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                                                <button
                                                    onClick={() => openEditModal(listing)}
                                                    className="flex-1 py-2 px-3 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                                                >
                                                    <Edit2 size={14} /> Edit Price
                                                </button>
                                                <button
                                                    onClick={() => setShowDeleteConfirm(listing.id)}
                                                    className="flex-1 py-2 px-3 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 flex items-center justify-center gap-2 transition"
                                                >
                                                    <Trash2 size={14} /> Cancel Listing
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                                <p className="text-sm text-gray-500 italic">
                                                    {listing.status === 'PENDING_TRANSACTION'
                                                        ? 'Currently being purchased by a buyer...'
                                                        : listing.status === 'CLOSED'
                                                            ? 'Sold successfully'
                                                            : 'Listing cancelled'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Price Modal */}
                {editingListing && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Update Price</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Update the price per tonne for this listing.
                            </p>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">New Price ($/tonne)</label>
                                <input
                                    type="number"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                    placeholder="0.00"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditingListing(null)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdatePrice}
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    {processing ? 'Updating...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in border-t-4 border-red-500">
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <AlertCircle className="text-red-600" size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Cancel Listing?</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    Are you sure you want to cancel this listing?
                                    <br/>
                                    The credits will be returned to your wallet immediately.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(null)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Keep Listing
                                </button>
                                <button
                                    onClick={() => handleCancelListing(showDeleteConfirm)}
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                >
                                    {processing ? 'Cancelling...' : 'Yes, Cancel'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
            <Footer />
        </>
    );
};

export default MyListingsPage;