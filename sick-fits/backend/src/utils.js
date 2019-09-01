function checkPermission(user, permissionsNeeded) {
  const matchedPermissions = user.permissions
    ? user.permissions.filter(permissionTheyHave =>
        permissionsNeeded.includes(permissionTheyHave)
      )
    : [];
  if (!matchedPermissions.length) {
    throw new Error(`You do not have sufficient permissions

      : ${permissionsNeeded}

      You Have:

      ${user.permissions}
      `);
  } else {
    return true;
  }
}

exports.checkPermission = checkPermission;
