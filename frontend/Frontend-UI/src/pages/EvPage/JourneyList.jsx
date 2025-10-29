import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../Components/EVComponents/Navbar'
import EvOwnerAPI from '../../api/EvOwnerAPI'
import { MapPin, Clock, Battery, Route, Calendar, Filter, Search, Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

function JourneyList() {
  const navigate = useNavigate()
  const [journeys, setJourneys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [uploadStatus, setUploadStatus] = useState(null) // 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicleId, setSelectedVehicleId] = useState('')

  // Fetch journeys from API
  // Update your useEffect to also fetch vehicles
useEffect(() => {
  fetchJourneys()
  fetchMyVehicles() // ✅ Add this line
}, [])

  const fetchMyVehicles = async () => {
  try {
    console.log('🚗 Fetching user vehicles...')
    const response = await EvOwnerAPI.vehicles.getMyVehicles()
    const vehicleData = response.data?.data || response.data || []
    console.log('✅ Vehicles fetched:', vehicleData)
    setVehicles(Array.isArray(vehicleData) ? vehicleData : [])
    
    // Auto-select first vehicle if available
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
      
      // Check if token exists before making API call
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
      
      if (!token) {
        console.warn('⚠️ No token found in storage, redirecting to login')
        navigate('/login')
        return
      }
      
      console.log('🔍 Token found, fetching journeys...')
      const response = await EvOwnerAPI.journeys.getMyJourneys()
      console.log('✅ Journeys fetched:', response.data)
      
      // Ensure we always set an array, even if response.data is undefined or null
      const journeysData = Array.isArray(response.data) ? response.data : []
      setJourneys(journeysData)
    } catch (error) {
      console.error('❌ Failed to fetch journeys:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Only redirect to login for authentication errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.warn('🔐 Authentication failed, redirecting to login')
        navigate('/login')
      } else {
        // For other errors, show error but don't redirect
        console.error('⚠️ API error, but not redirecting:', error)
        setJourneys([])
      }
    } finally {
      setLoading(false)
    }
  }


  const filteredJourneys = (journeys || []).filter(journey => {
    const startLocation = journey.startLocation || journey.start_location || ''
    const endLocation = journey.endLocation || journey.end_location || ''
    const status = journey.verificationStatus || journey.verification_status || journey.status || 'pending'
    
    const matchesSearch = startLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         endLocation.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || status.toLowerCase() === filterStatus.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
  
  if (!selectedVehicleId) {
    setUploadStatus('error')
    setUploadMessage('Please select a vehicle first')
    return
  }
  
  try {
    setUploadStatus('uploading')
    setUploadProgress(0)
    setUploadMessage('Reading CSV file...')
    
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result
        setUploadProgress(25)
        setUploadMessage('Processing CSV data...')
        
        const rows = parseCSV(csvText)
        console.log('📊 Parsed CSV rows:', rows)
        setUploadProgress(50)
        setUploadMessage(`Uploading ${rows.length} journey records...`)
        
        // Upload journeys one by one
        let successCount = 0
        let errorCount = 0
        const errors = []
        
        for (let i = 0; i < rows.length; i++) {
          try {
            console.log(`🚀 Processing journey ${i + 1}:`, rows[i])
            
            // ✅ CORRECTED: Use selected vehicle ID automatically
            const journeyData = {
              vehicleId: selectedVehicleId, // ✅ Auto-filled from dropdown
              distanceKm: parseFloat(rows[i].distanceKm || rows[i].distance_km),
              energyConsumedKwh: parseFloat(rows[i].energyConsumedKwh || rows[i].energy_consumed_kwh),
              startTime: rows[i].startTime || rows[i].start_time,
              endTime: rows[i].endTime || rows[i].end_time
            }
            
            // Validate required fields
            if (!journeyData.distanceKm || journeyData.distanceKm <= 0) {
              throw new Error('distanceKm must be a positive number')
            }
            if (!journeyData.energyConsumedKwh || journeyData.energyConsumedKwh <= 0) {
              throw new Error('energyConsumedKwh must be a positive number')
            }
            if (!journeyData.startTime) {
              throw new Error('startTime is required')
            }
            if (!journeyData.endTime) {
              throw new Error('endTime is required')
            }
            
            console.log(`📤 Sending journey data:`, journeyData)
            
            // Send to API
            const response = await EvOwnerAPI.journeys.createJourney(journeyData)
            console.log(`✅ Journey ${i + 1} created successfully:`, response.data)
            
            successCount++
            
            setUploadProgress(50 + ((i + 1) / rows.length) * 40)
            setUploadMessage(`Processed ${i + 1}/${rows.length} journeys...`)
            
          } catch (error) {
            console.error(`❌ Failed to create journey ${i + 1}:`, error)
            console.error('Error details:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status
            })
            
            errorCount++
            errors.push(`Row ${i + 2}: ${error.response?.data?.message || error.message}`)
          }
        }
        
        setUploadProgress(100)
        
        if (errorCount === 0) {
          setUploadStatus('success')
          setUploadMessage(`✅ Successfully uploaded ${successCount} journeys!`)
          setTimeout(() => {
            closeUploadModal()
            fetchJourneys()
          }, 2000)
        } else if (successCount > 0) {
          setUploadStatus('error')
          setUploadMessage(`⚠️ Uploaded ${successCount} journeys, ${errorCount} failed. First errors: ${errors.slice(0, 2).join(' | ')}`)
        } else {
          setUploadStatus('error')
          setUploadMessage(`❌ All uploads failed. Errors: ${errors.slice(0, 3).join(' | ')}`)
        }
        
      } catch (error) {
        setUploadStatus('error')
        setUploadMessage(`Parse error: ${error.message}`)
      }
    }
    
    reader.onerror = () => {
      setUploadStatus('error')
      setUploadMessage('Failed to read file')
    }
    
    reader.readAsText(csvFile)
    
  } catch (error) {
    setUploadStatus('error')
    setUploadMessage(error.message)
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
      <div className="min-h-screen bg-gray-50">
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
                    placeholder="Search journeys by location..."
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
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

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
                  <p className="text-gray-500">Start your first journey to see it here!</p>
                </div>
              ) : (
                filteredJourneys.map((journey) => {
                  const startLocation = journey.startLocation || journey.start_location || 'Unknown'
                  const endLocation = journey.endLocation || journey.end_location || 'Unknown'
                  const distance = journey.distanceKm || journey.distance_km || 0
                  const co2Reduced = journey.co2ReducedKg || journey.co2_reduced_kg || 0
                  const energyConsumed = journey.energyConsumedKwh || journey.energy_consumed_kwh || 0
                  const startTime = journey.startTime || journey.start_time || journey.created_at
                  const endTime = journey.endTime || journey.end_time
                  const status = journey.verificationStatus || journey.verification_status || journey.status || 'pending'
                  const vehicleId = journey.vehicleId || journey.vehicle_id || 'Unknown'
                  
                  // Calculate duration if we have both start and end times
                  let duration = 0
                  if (startTime && endTime) {
                    const start = new Date(startTime)
                    const end = new Date(endTime)
                    duration = Math.round((end - start) / (1000 * 60)) // minutes
                  }
                  
                  return (
                    <div key={journey.journeyId || journey.journey_id || journey.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-green-500" />
                              <span className="font-medium text-gray-900">{startLocation}</span>
                            </div>
                            <div className="text-gray-400">→</div>
                            <div className="flex items-center gap-2">
                              <MapPin size={16} className="text-red-500" />
                              <span className="font-medium text-gray-900">{endLocation}</span>
                            </div>
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
                              <Battery size={16} />
                              <span>{co2Reduced} kg CO₂</span>
                            </div>
                          </div>
                          
                          {energyConsumed > 0 && (
                            <div className="mt-2 text-sm text-gray-500">
                              Energy Consumed: {energyConsumed} kWh
                            </div>
                          )}
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                          <div className="text-right text-sm text-gray-500">
                            <div className="font-medium">Vehicle: {vehicleId}</div>
                          </div>
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

        {/* ✅ NEW: Vehicle Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Vehicle <span className="text-red-500">*</span>
          </label>
          {vehicles.length > 0 ? (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id || vehicle.vehicle_id} value={vehicle.id || vehicle.vehicle_id}>
                  {vehicle.model} - {vehicle.vin}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              No vehicles found. Please add a vehicle first in your profile.
            </div>
          )}
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
          <p className="text-xs font-semibold text-blue-900 mb-1">CSV Format (no vehicleId needed!):</p>
          <code className="text-xs text-blue-800 block">
            distanceKm,energyConsumedKwh,startTime,endTime
          </code>
          <p className="text-xs text-blue-700 mt-1">
            Example: 150.5,28.3,2025-10-16T08:00:00,2025-10-16T10:30:00
          </p>
        </div>

        {uploadStatus && (
          <div className="mb-4">
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              uploadStatus === 'success' ? 'bg-green-50 text-green-700' :
              uploadStatus === 'error' ? 'bg-red-50 text-red-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {uploadStatus === 'success' && <CheckCircle size={20} />}
              {uploadStatus === 'error' && <XCircle size={20} />}
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
    </>
  )
}

export default JourneyList