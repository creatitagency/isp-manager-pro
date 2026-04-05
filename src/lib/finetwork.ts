/**
 * Finetwork Operators API Client
 * Based on: https://finetwork-operators-api.readme.io/reference
 *
 * This client handles authentication, line management, portabilities,
 * product catalog, and order management through Finetwork's API.
 */

interface FinetworkConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  operatorId: string;
}

interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  expiresAt: number;
}

interface FinetworkLine {
  id: string;
  msisdn: string;
  iccid: string;
  imsi: string;
  status: string;
  productId: string;
  activationDate: string;
}

interface FinetworkProduct {
  id: string;
  name: string;
  type: "mobile" | "fiber" | "convergent";
  price: number;
  data?: string;
  speed?: string;
  minutes?: string;
}

interface FinetworkOrder {
  id: string;
  type: "new" | "portability" | "change" | "cancel";
  status: string;
  lineId?: string;
  msisdn?: string;
  createdAt: string;
}

interface PortabilityRequest {
  msisdn: string;
  donorOperator: string;
  iccid: string;
  clientName: string;
  clientDni: string;
  productId: string;
}

class FinetworkClient {
  private config: FinetworkConfig;
  private token: AuthToken | null = null;

  constructor(config?: Partial<FinetworkConfig>) {
    this.config = {
      apiUrl: config?.apiUrl || process.env.FINETWORK_API_URL || "https://api.finetwork.com",
      clientId: config?.clientId || process.env.FINETWORK_CLIENT_ID || "",
      clientSecret: config?.clientSecret || process.env.FINETWORK_CLIENT_SECRET || "",
      operatorId: config?.operatorId || process.env.FINETWORK_OPERATOR_ID || "",
    };
  }

  // ─── AUTHENTICATION ──────────────────────────────────────────
  async authenticate(): Promise<AuthToken> {
    if (this.token && Date.now() < this.token.expiresAt - 60000) {
      return this.token;
    }

    const response = await fetch(`${this.config.apiUrl}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret,
        grantType: "client_credentials",
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new FinetworkError("Authentication failed", response.status, error);
    }

    const data = await response.json();
    this.token = {
      accessToken: data.access_token,
      tokenType: data.token_type || "Bearer",
      expiresIn: data.expires_in,
      expiresAt: Date.now() + (data.expires_in * 1000),
    };

    return this.token;
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const token = await this.authenticate();

    const response = await fetch(`${this.config.apiUrl}${path}`, {
      method,
      headers: {
        "Authorization": `${token.tokenType} ${token.accessToken}`,
        "Content-Type": "application/json",
        "X-Operator-Id": this.config.operatorId,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new FinetworkError(`API error: ${path}`, response.status, error);
    }

    return response.json();
  }

  // ─── PRODUCTS / CATALOG ──────────────────────────────────────
  async getProducts(): Promise<FinetworkProduct[]> {
    return this.request("GET", "/v1/products");
  }

  async getProduct(productId: string): Promise<FinetworkProduct> {
    return this.request("GET", `/v1/products/${productId}`);
  }

  // ─── LINES ───────────────────────────────────────────────────
  async getLines(params?: { status?: string; page?: number; limit?: number }): Promise<{ data: FinetworkLine[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    return this.request("GET", `/v1/lines?${query}`);
  }

  async getLine(lineId: string): Promise<FinetworkLine> {
    return this.request("GET", `/v1/lines/${lineId}`);
  }

  async getLineByMsisdn(msisdn: string): Promise<FinetworkLine> {
    return this.request("GET", `/v1/lines/msisdn/${msisdn}`);
  }

  async activateLine(lineId: string, productId: string): Promise<FinetworkOrder> {
    return this.request("POST", `/v1/lines/${lineId}/activate`, { productId });
  }

  async suspendLine(lineId: string, reason: string): Promise<void> {
    return this.request("POST", `/v1/lines/${lineId}/suspend`, { reason });
  }

  async resumeLine(lineId: string): Promise<void> {
    return this.request("POST", `/v1/lines/${lineId}/resume`);
  }

  async cancelLine(lineId: string, reason: string): Promise<void> {
    return this.request("POST", `/v1/lines/${lineId}/cancel`, { reason });
  }

  async changeProduct(lineId: string, newProductId: string): Promise<FinetworkOrder> {
    return this.request("POST", `/v1/lines/${lineId}/change-product`, { productId: newProductId });
  }

  // ─── PORTABILITIES ───────────────────────────────────────────
  async requestPortability(data: PortabilityRequest): Promise<FinetworkOrder> {
    return this.request("POST", "/v1/portabilities", data);
  }

  async getPortabilityStatus(orderId: string): Promise<FinetworkOrder> {
    return this.request("GET", `/v1/portabilities/${orderId}`);
  }

  async getPortabilities(params?: { status?: string; page?: number }): Promise<{ data: FinetworkOrder[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    return this.request("GET", `/v1/portabilities?${query}`);
  }

  // ─── CONSUMPTION / CDRs ──────────────────────────────────────
  async getConsumption(lineId: string, period: string): Promise<{
    voice: { minutes: number; cost: number };
    sms: { count: number; cost: number };
    data: { mb: number; cost: number };
  }> {
    return this.request("GET", `/v1/lines/${lineId}/consumption/${period}`);
  }

  async getCDRs(lineId: string, params: { from: string; to: string; type?: string }): Promise<{
    data: Array<{
      id: string;
      type: string;
      origin: string;
      destination: string;
      dateTime: string;
      duration: number;
      cost: number;
    }>;
  }> {
    const query = new URLSearchParams({ from: params.from, to: params.to });
    if (params.type) query.set("type", params.type);
    return this.request("GET", `/v1/lines/${lineId}/cdrs?${query}`);
  }

  // ─── ORDERS ──────────────────────────────────────────────────
  async getOrders(params?: { status?: string; page?: number }): Promise<{ data: FinetworkOrder[]; total: number }> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    return this.request("GET", `/v1/orders?${query}`);
  }

  async getOrder(orderId: string): Promise<FinetworkOrder> {
    return this.request("GET", `/v1/orders/${orderId}`);
  }

  // ─── SIM MANAGEMENT ─────────────────────────────────────────
  async getSIMStock(): Promise<{ available: number; assigned: number; total: number }> {
    return this.request("GET", "/v1/sims/stock");
  }

  async assignSIM(iccid: string, lineId: string): Promise<void> {
    return this.request("POST", `/v1/sims/${iccid}/assign`, { lineId });
  }

  // ─── COVERAGE ────────────────────────────────────────────────
  async checkCoverage(postalCode: string): Promise<{
    fiber: boolean;
    fiberSpeed: string[];
    mobile4G: boolean;
    mobile5G: boolean;
  }> {
    return this.request("GET", `/v1/coverage/${postalCode}`);
  }
}

class FinetworkError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details: unknown
  ) {
    super(message);
    this.name = "FinetworkError";
  }
}

// Singleton instance
let finetworkInstance: FinetworkClient | null = null;

export function getFinetworkClient(): FinetworkClient {
  if (!finetworkInstance) {
    finetworkInstance = new FinetworkClient();
  }
  return finetworkInstance;
}

export { FinetworkClient, FinetworkError };
export type { FinetworkConfig, FinetworkLine, FinetworkProduct, FinetworkOrder, PortabilityRequest };
