// Carbon Interface API
export const carbonAPI = {
  baseURL: 'https://www.carboninterface.com/api/v1',
  apiKey: 'WHw5TawUGIvAb0x8S5a2w',
  
  async calculateEmissions(data: any) {
    try {
      const response = await fetch(`${this.baseURL}/estimates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Carbon API error:', error)
      // Return fallback calculation
      return {
        data: {
          attributes: {
            carbon_kg: data.distance_value ? data.distance_value * 0.2 : 0
          }
        }
      }
    }
  }
}

// OCR.space API
export const ocrAPI = {
  apiKey: 'K88395282488957',
  
  async parseImage(imageFile: File) {
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('apikey', this.apiKey)
      formData.append('language', 'eng')
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('OCR API error:', error)
      return {
        ParsedResults: [{
          ParsedText: 'Could not parse image text'
        }]
      }
    }
  }
}

// Open Food Facts API (no API key needed)
export const foodAPI = {
  async getProduct(barcode: string) {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Food API error:', error)
      return {
        status: 0,
        product: null
      }
    }
  }
}

// OpenStreetMap API (no API key needed)
export const mapAPI = {
  async searchRecyclingCenters(lat: number, lon: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=recycling+center&format=json&lat=${lat}&lon=${lon}&radius=10000&limit=10`
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Map API error:', error)
      return []
    }
  }
}