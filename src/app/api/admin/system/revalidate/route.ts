import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdminAuth } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    if (!(await verifyAdminAuth(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await request.json();

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ success: true, message: `Revalidated path: ${path}` });
    }


    // Default: revalidate the whole app layout (layout)
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, message: "Revalidated full site layout" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
