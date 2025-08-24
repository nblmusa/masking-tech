import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// For server components
const supabaseServer = () => {
  cookies().getAll(); // Keep cookies in the JS execution context for Next.js build
  return createServerComponentClient({ cookies });
};

// For API routes
const supabaseApi = () => {
  return createRouteHandlerClient({ cookies });
};

export { supabaseServer as default, supabaseApi };