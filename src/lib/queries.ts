"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { createInternalTheme } from "@clerk/themes/dist/clerk-js/src/ui/foundations";
import { User } from "@prisma/client";

export const getAuthUserDetails = async () => {
  const user = await currentUser();
  if (!user) return;
  const userDetails = await db.user.findUnique({
    where: { email: user.emailAddresses[0].emailAddress },
    include: {
      Agency: {
        include: {
          SidebarOption: true,
          SubAccount: { include: { SidebarOption: true } },
        },
      },
      Permissions: true,
    },
  });
  return userDetails;
};
export const saveActivityLogsNotification = async ({
  agencyId,
  description,
  subaccountId,
}: {
  agencyId?: string;
  description: string;
  subaccountId: string;
}) => {
  const authUser = await currentUser();
  let userData;
  if (!authUser) {
    const response = await db.user.findFirst({
      where: {
        Agency: {
          SubAccount: {
            some: { id: subaccountId },
          },
        },
      },
    });
    if (response) {
      userData = response;
    }
  } else {
    userData = await db.user.findUnique({
      where: { email: authUser?.emailAddresses[0].emailAddress },
    });
  }
  if (!userData) {
    console.log("User not found");
    return;
  }
};

export const createTeamUser = async (agencyId: string, user: User) => {
  if (user.role === "AGENCY_OWNER") return null;
  const response = await db.user.create({ data: { ...user } });
  return response;
};

export const verifyAndAcceptInvitation = async () => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  const invitation = await db.invitation.findUnique({
    where: {
      email: user.emailAddresses[0].emailAddress,
      status: "PENDING",
    },
  });

  if (invitation) {
    const userDetails = await createTeamUser(invitation.agencyId, {
      id: user.id,
      email: invitation.email,
      agencyId: invitation.agencyId,
      avatarUrl: user.imageUrl,
      name: `${user.firstName} ${user.lastName}`,
      role: invitation.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
};
