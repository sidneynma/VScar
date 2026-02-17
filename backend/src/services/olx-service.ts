import axios from "axios"

export interface OLXListingPayload {
  title: string
  description: string
  price: number
  images: string[]
  category: string
  brand: string
  model: string
  year: number
  mileage: number
  fuel_type: string
  transmission: string
  doors: number
  color: string
  seller_name: string
  seller_phone: string
  seller_email: string
}

export class OLXService {
  private apiKey: string
  private baseUrl = "https://api.olx.com.br/v2"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async createListing(payload: OLXListingPayload) {
    try {
      const response = await axios.post(`${this.baseUrl}/ads`, this.formatOLXPayload(payload), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      return {
        success: true,
        external_id: response.data.id,
        url: response.data.url,
        data: response.data,
      }
    } catch (error: any) {
      console.error("OLX API Error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  }

  async updateListing(externalId: string, payload: Partial<OLXListingPayload>) {
    try {
      const response = await axios.put(`${this.baseUrl}/ads/${externalId}`, this.formatOLXPayload(payload), {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error("OLX Update Error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  }

  async deleteListing(externalId: string) {
    try {
      await axios.delete(`${this.baseUrl}/ads/${externalId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      return { success: true }
    } catch (error: any) {
      console.error("OLX Delete Error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  }

  async getListing(externalId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/ads/${externalId}`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      return {
        success: true,
        data: response.data,
      }
    } catch (error: any) {
      console.error("OLX Get Error:", error.response?.data || error.message)
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      }
    }
  }

  private formatOLXPayload(payload: OLXListingPayload | Partial<OLXListingPayload>) {
    return {
      title: payload.title,
      description: payload.description,
      price: payload.price,
      images: payload.images?.map((img) => ({ url: img })) || [],
      category: "cars", // ou "motorcycles", "trucks" etc
      ad_type: "sell",
      attributes: [
        { key: "brand", value: payload.brand },
        { key: "model", value: payload.model },
        { key: "year", value: String(payload.year) },
        { key: "mileage", value: String(payload.mileage) },
        { key: "fuel_type", value: payload.fuel_type },
        { key: "transmission", value: payload.transmission },
        { key: "doors", value: String(payload.doors) },
        { key: "color", value: payload.color },
      ],
      seller: {
        name: payload.seller_name,
        phone: payload.seller_phone,
        email: payload.seller_email,
      },
    }
  }
}
