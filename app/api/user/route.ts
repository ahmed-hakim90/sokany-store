import { NextRequest, NextResponse } from "next/server";
import { createWooClient } from "@/lib/create-woo-client";
import { getSessionFromRequest } from "@/lib/auth-request";

type WCCustomer = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  avatar_url?: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
};

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const woo = await createWooClient();
    const response = await woo.get<WCCustomer[]>("/customers", {
      params: { email: session.email, per_page: 1 },
    });
    const customer = response.data[0];
    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body: unknown = await request.json();
    const woo = await createWooClient();
    const list = await woo.get<WCCustomer[]>("/customers", {
      params: { email: session.email, per_page: 1 },
    });
    const customer = list.data[0];
    if (!customer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const response = await woo.put<WCCustomer>(
      `/customers/${customer.id}`,
      body,
    );
    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}
