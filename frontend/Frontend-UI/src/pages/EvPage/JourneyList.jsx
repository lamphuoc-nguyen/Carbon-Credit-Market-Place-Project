import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Components/EVComponents/Navbar'
import Footer from '../../Components/Footer'
import EvOwnerAPI from '../../api/EvOwnerAPI'
import { Clock, Battery, Route, Calendar, Filter, Search, Upload, FileText, CheckCircle, XCircle, AlertCircle, Zap } from 'lucide-react'

function JourneyList() {
  const navigate = useNavigate()
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploadStatus, setUploadStatus] = useState(null)
  const [uploadMessage, setUploadMessage] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

  useEffect(() => {
    fetchJourneys()
    fetchMyVehicles()
  }, [])

  const fetchMyVehicles = async () => {
    try {
      console.log('🚗 Fetching user vehicles...')
      const response = await EvOwnerAPI.vehicles.getMyVehicles()
      const vehicleData = response.data?.data || response.data || []
      console.log('✅ Vehicles fetched:', vehicleData)
      setVehicles(Array.isArray(vehicleData) ? vehicleData : [])

      if (vehicleData.length > 0) {
        setSelectedVehicleId(vehicleData[0].id || vehicleData[0].vehicle_id)
      }
    } catch (error) {
      console.error('❌ Failed to fetch vehicles:', error)
      setVehicles([])
    }
  }

  const fetchJourneys = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')

      if (!token) {
        console.warn('⚠️ No token found in storage, redirecting to login')
        navigate('/login')
        return
      }

      console.log('🔍 Token found, fetching journeys...')
      const response = await EvOwnerAPI.journeys.getMyJourneys()
      console.log('✅ Full API Response:', response)

      // Fix: Handle nested data structure
      const journeysData = response.data?.data || response.data || []
      console.log('✅ Journeys data extracted:', journeysData)
      setJourneys(Array.isArray(journeysData) ? journeysData : [])
    } catch (error) {
      console.error('❌ Failed to fetch journeys:', error)

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login')
        navigate('/login')
      } else {
        console.error('⚠️ API error, but not redirecting:', error)
        setJourneys([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredJourneys = (journeys || []).filter(journey => {
    const distance = journey.distanceKm || 0
    const energy = journey.energyConsumedKwh || 0
    const status = journey.verificationStatus || 'PENDING_VERIFICATION'

    // Search by distance or energy (since there are no location fields)
    const matchesSearch =
      distance.toString().includes(searchQuery) ||
      energy.toString().includes(searchQuery) ||
      (journey.vehicleId && journey.vehicleId.includes(searchQuery))

    const matchesFilter = filterStatus === 'all' ||
      status.toLowerCase().replace('_', ' ').includes(filterStatus.toLowerCase())

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase()
    if (normalizedStatus.includes('verified') && !normalizedStatus.includes('pending')) {
      return 'text-green-600 bg-green-100'
    }
    if (normalizedStatus === 'valid' || normalizedStatus.includes('valid')) {
      return 'text-green-600 bg-green-100' // Status for auto-approved journeys
    }
    if (normalizedStatus === 'invalid' || normalizedStatus.includes('invalid')) {
      return 'text-red-600 bg-red-100' // Status for invalid journeys
    }
    if (normalizedStatus.includes('pending')) {
      return 'text-yellow-600 bg-yellow-100'
    }
    if (normalizedStatus.includes('rejected')) {
      return 'text-orange-600 bg-orange-100'
    }
    return 'text-gray-600 bg-gray-100'
  }

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim())
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const row = {}

      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })

      rows.push(row)
    }

    return rows
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
    } else {
      setUploadStatus('error')
      setUploadMessage('Please select a valid CSV file')
    }
  }

  const uploadCSV = async () => {
    if (!csvFile) {
      setUploadStatus('error')
      setUploadMessage('Please select a CSV file')
      return
    }

    try {
      setUploadStatus('uploading')
      setUploadProgress(0)
      setUploadMessage('Uploading CSV file...')

      // Use the new backend CSV import endpoint
      const response = await EvOwnerAPI.journeys.importCsv(csvFile)

      setUploadProgress(100)

      // Handle the response from the new import endpoint
      const importResult = response.data?.data || response.data

      console.log('📊 CSV Import Result:', importResult)

      if (importResult.failed > 0) {
        setUploadStatus('warning')
        setUploadMessage(
          `❌ Processed ${importResult.processed} rows: ${importResult.success} successful, ${importResult.failed} failed. ` +
          (importResult.errors && importResult.errors.length > 0 ?
            `Errors: ${importResult.errors.slice(0, 3).join(' | ')}` : '')
        )
      } else {
        setUploadStatus('success')
        setUploadMessage(
          `✅ Successfully processed ${importResult.success} journeys! ` +
          `Auto-validated journeys will immediately add CO2 to your wallet.`
        )
      }

      // Auto-close on success after showing the message
      setTimeout(() => {
        if (importResult.failed === 0) {
          closeUploadModal()
        }
        fetchJourneys()
      }, 3000)

    } catch (error) {
      console.error('❌ CSV upload failed:', error)
      setUploadStatus('error')

      // Handle specific error messages from the backend
      const errorMessage = error.response?.data?.message || error.message

      if (errorMessage.includes('Duplicate journey detected')) {
        setUploadMessage('❌ Duplicate journeys detected. Please check for existing journeys with same date and characteristics.')
      } else if (errorMessage.includes('duplicate')) {
        setUploadMessage('❌ Some journeys are duplicates of existing data. Please review your CSV for repeated entries.')
      } else {
        setUploadMessage(`❌ Upload failed: ${errorMessage}`)
      }

      setUploadProgress(0)
    }
  }

  const closeUploadModal = () => {
    setShowUploadModal(false)
    setCsvFile(null)
    setUploadStatus(null)
    setUploadMessage('')
    setUploadProgress(0)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50" 
           style={{
             backgroundImage: "url('/src/image/journeybg.png')",
             backgroundSize: '100% auto',
             backgroundPosition: 'top center',
             backgroundRepeat: 'no-repeat',
             backgroundAttachment: 'fixed'
           }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Journeys</h1>
                <p className="text-gray-600">Track your electric vehicle journeys and carbon savings</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 sm:mt-0 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Upload size={20} />
                Upload CSV
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by distance, energy, or vehicle ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="valid">Valid</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
            </div>
          </div>

          {/* No Vehicle Warning */}
          {!loading && vehicles.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">No vehicles detected</h3>
                  <p className="text-yellow-800 mb-4">
                    You need to link a vehicle to your account before you can upload or track journeys.
                  </p>
                  <button
                    onClick={() => navigate('/ev-dashboard/profile')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Link Your Vehicle Here
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Journeys List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJourneys.length === 0 ? (
                <div className="text-center py-12">
                  <Route className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No journeys found</h3>
                  <p className="text-gray-500">
                    {vehicles.length === 0 
                      ? 'Please link a vehicle first to start tracking your journeys.'
                      : 'Start your first journey to see it here!'}
                  </p>
                </div>
              ) : (
                filteredJourneys.map((journey) => {
                  const distance = journey.distanceKm || 0
                  const co2Reduced = journey.co2ReducedKg || 0
                  const energyConsumed = journey.energyConsumedKwh || 0
                  const startTime = journey.startTime
                  const endTime = journey.endTime
                  const status = journey.verificationStatus || 'PENDING_VERIFICATION'
                  const vehicleId = journey.vehicleId || 'No Vehicle'

                  // Calculate duration
                  let duration = 0
                  if (startTime && endTime) {
                    const start = new Date(startTime)
                    const end = new Date(endTime)
                    duration = Math.round((end - start) / (1000 * 60)) // minutes
                  }

                  return (
                    <div key={journey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-lg font-semibold text-gray-900">Journey #{journey.id.slice(0, 8)}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {getStatusLabel(status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar size={16} />
                              <span>{startTime ? new Date(startTime).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Route size={16} />
                              <span>{distance} km</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock size={16} />
                              <span>{duration} min</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Battery size={16} className="text-green-500" />
                              <span>{co2Reduced.toFixed(2)} kg CO₂</span>
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                            <div>Energy: <span className="font-medium text-gray-700">{energyConsumed} kWh</span></div>
                            <div>Vehicle: <span className="font-medium text-gray-700">{vehicleId}</span></div>
                            {journey.verifiedByUsername && (
                              <div>Verified by: <span className="font-medium text-gray-700">{journey.verifiedByUsername}</span></div>
                            )}
                          </div>

                          {journey.verificationNotes && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                              <strong>Note:</strong> {journey.verificationNotes}
                            </div>
                          )}

                          {journey.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                              <strong>Reason:</strong> {journey.rejectionReason}
                            </div>
                          )}
                          
                          {status.toLowerCase() === 'invalid' && journey.validationErrors && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                              <strong>Validation Errors:</strong> {journey.validationErrors}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Journey CSV</h3>
                <button
                  onClick={closeUploadModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Info about automatic vehicle selection */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  {vehicles.length > 0 ? (
                    <span className="block mt-1">
                      Using: <strong>{vehicles[0].model} - {vehicles[0].vin}</strong>
                    </span>
                  ) : (
                    <span className="block mt-1 text-red-600">
                      ⚠️ No vehicles found. Please add a vehicle first in your profile.
                    </span>
                  )}
                </p>
              </div>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {csvFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                    <FileText size={16} />
                    <span>{csvFile.name}</span>
                  </div>
                )}
              </div>

              {/* CSV Format Helper */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs font-semibold text-blue-900 mb-1">CSV Format:</p>
                <code className="text-xs text-blue-800 block">
                  distanceKm,energyConsumedKwh,startTime,endTime
                </code>
                <p className="text-xs text-blue-700 mt-1">
                  Example: 150.5,28.3,2025-10-16T08:00:00,2025-10-16T10:30:00
                </p>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Duplicate journeys (same date, distance, and energy) will be automatically detected and rejected.
                  </p>
                </div>
              </div>

              {uploadStatus && (
                <div className="mb-4">
                  <div className={`p-3 rounded-lg flex items-center gap-2 ${
                    uploadStatus === 'success' ? 'bg-green-500/50 text-white' :
                    uploadStatus === 'error' ? 'bg-red-500/50 text-white' :
                    uploadStatus === 'warning' ? 'bg-red-500/90 text-white' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {uploadStatus === 'success' && <CheckCircle size={20} />}
                    {uploadStatus === 'error' && <XCircle size={20} />}
                    {uploadStatus === 'warning' && <XCircle size={20} />}
                    {uploadStatus === 'uploading' && <AlertCircle size={20} className="animate-spin" />}
                    <span className="text-sm">{uploadMessage}</span>
                  </div>

                  {uploadStatus === 'uploading' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={closeUploadModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={uploadCSV}
                  disabled={!csvFile || !selectedVehicleId || uploadStatus === 'uploading'}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload CSV'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  )
}

export default JourneyList