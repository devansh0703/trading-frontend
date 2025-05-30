import { users, trendlines, type User, type InsertUser, type Trendline, type InsertTrendline, type OHLCData } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllTrendlines(): Promise<Trendline[]>;
  getTrendline(id: number): Promise<Trendline | undefined>;
  createTrendline(trendline: InsertTrendline): Promise<Trendline>;
  updateTrendline(id: number, updates: Partial<InsertTrendline>): Promise<Trendline | undefined>;
  deleteTrendline(id: number): Promise<boolean>;
  getMockOHLCData(): Promise<OHLCData[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trendlines: Map<number, Trendline>;
  private currentUserId: number;
  private currentTrendlineId: number;

  constructor() {
    this.users = new Map();
    this.trendlines = new Map();
    this.currentUserId = 1;
    this.currentTrendlineId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllTrendlines(): Promise<Trendline[]> {
    return Array.from(this.trendlines.values());
  }

  async getTrendline(id: number): Promise<Trendline | undefined> {
    return this.trendlines.get(id);
  }

  async createTrendline(insertTrendline: InsertTrendline): Promise<Trendline> {
    const id = this.currentTrendlineId++;
    const now = new Date();
    const trendline: Trendline = {
      ...insertTrendline,
      id,
      createdAt: now,
    };
    this.trendlines.set(id, trendline);
    return trendline;
  }

  async updateTrendline(id: number, updates: Partial<InsertTrendline>): Promise<Trendline | undefined> {
    const trendline = this.trendlines.get(id);
    if (!trendline) return undefined;

    const updatedTrendline = { ...trendline, ...updates };
    this.trendlines.set(id, updatedTrendline);
    return updatedTrendline;
  }

  async deleteTrendline(id: number): Promise<boolean> {
    return this.trendlines.delete(id);
  }

  async getMockOHLCData(): Promise<OHLCData[]> {
    const data: OHLCData[] = [];
    let basePrice = 43000;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 100; i++) {
      const timestamp = now - (100 - i) * 300; // 5-minute intervals
      const volatility = 0.02;
      const change = (Math.random() - 0.5) * basePrice * volatility;
      
      const open = basePrice;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * basePrice * 0.01;
      const low = Math.min(open, close) - Math.random() * basePrice * 0.01;
      
      data.push({
        timestamp,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: Math.floor(Math.random() * 1000) + 100
      });
      
      basePrice = close;
    }
    
    return data;
  }
}

export const storage = new MemStorage();
