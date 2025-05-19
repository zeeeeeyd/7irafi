export const roles = ['client', 'artisan', 'admin'];

export const roleRights = new Map();
roleRights.set(roles[0], ['getOrders', 'manageOrders']);
roleRights.set(roles[1], ['getPosts', 'managePosts', 'getOrders', 'manageOrders']);
roleRights.set(roles[2], ['getUsers', 'manageUsers', 'getPosts', 'managePosts', 'getOrders', 'manageOrders']);