import React, { useState, useEffect } from 'react'
import axios from 'axios'

function DomainFinder() {
  const [domainInput, setDomainInput] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination settings
  const rowsPerPage = 10
  
  // Convert string to hexadecimal (required for the API)
  const stringToHex = (str) => {
    let hex = ''
    for (let i = 0; i < str.length; i++) {
      hex += '' + str.charCodeAt(i).toString(16)
    }
    return hex
  }
  
  // Search domain function
  const searchDomain = async () => {
    if (!domainInput.trim()) {
      setError("Please enter a domain to search")
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const domainHex = stringToHex(domainInput)
      const response = await axios.get(`https://dnstwister.report/api/fuzz/${domainHex}`)
      
      // Get fuzzy domains from the API
      const fuzzyDomains = response.data.fuzzy_domains
      
      // Reset search results
      setSearchResults([])
      setCurrentPage(1)
      setShowResults(true)
      
      // Process and fetch details for each domain
      const processedDomains = await Promise.all(
        fuzzyDomains.map(async (domain) => {
          try {
            // Get MX records
            const mxResponse = await axios.get(domain.has_mx_url)
            
            // Get IP records
            const ipResponse = await axios.get(domain.resolve_ip_url)
            
            return {
              domain: domain.domain,
              ip: ipResponse.data.ip || 'Not available',
              mx: mxResponse.data.mx,
              registered: mxResponse.data.mx ? true : false
            }
          } catch (err) {
            console.error(`Error fetching details for ${domain.domain}:`, err)
            return {
              domain: domain.domain,
              ip: 'Error fetching',
              mx: false,
              error: true
            }
          }
        })
      )
      
      setSearchResults(processedDomains)
    } catch (err) {
      console.error('Error searching domain:', err)
      setError("Error searching domain. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  
  // Handle Enter key press in the search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchDomain()
    }
  }
  
  // Pagination handlers
  const nextPage = () => {
    if (currentPage < Math.ceil(searchResults.length / rowsPerPage)) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }
  
  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return searchResults.slice(startIndex, endIndex)
  }

  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold text-[#000080] mb-6">Domain Finder</h1>
      
      {/* Search Section */}
      <div className=" p-5  mb-6">
        <h2 className="text-xl font-bold mb-4">Search Similar Domains</h2>
        <p className="mb-4 text-gray-600">
          Enter a domain to find similar looking domains that could be used for phishing.
        </p>
        <div className="flex">
          <input
            type="text"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="example.com"
            className="flex-1 p-3 border-2 border-gray-500 rounded-l-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={searchDomain}
            disabled={loading}
            className="border-2 border-[#000080] text-[#000080] hover:bg-green-200 hover:text-gray-800 py-2 px-6 rounded-r-lg font-bold transition-all shadow-md hover:shadow-lg"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
      
      {/* Results Section */}
      {showResults && (
        <div className="bg-[rgba(250,250,250,0.9)] p-5 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          
          {loading ? (
            <div className="text-center p-5">
              <div className="inline-block w-8 h-8 border-4 border-[#000080] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-600">Fetching domain variations...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center p-5 text-gray-600">
              No results found. Try a different domain.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Record</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MX Record</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getCurrentPageData().map((result, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{result.domain}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{result.ip}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {result.error ? (
                            <span className="text-gray-500">Error checking status</span>
                          ) : result.registered ? (
                            <span className="text-red-500">Domain is already registered</span>
                          ) : (
                            <span className="text-green-500">Domain available for phishing</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between mt-4">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`border border-gray-300 px-4 py-2 rounded ${
                    currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <span className="self-center text-gray-600">
                  Page {currentPage} of {Math.ceil(searchResults.length / rowsPerPage)}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(searchResults.length / rowsPerPage)}
                  className={`border border-gray-300 px-4 py-2 rounded ${
                    currentPage >= Math.ceil(searchResults.length / rowsPerPage) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default DomainFinder