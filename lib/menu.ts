import { db } from 'lib/turso'; // Hoặc file cấu hình kết nối Turso hiện tại của dự án

export async function getStoreMenus() {
  try {
    // Truy vấn lấy danh sách menu đang active, sắp xếp theo sort_order
    const result = await db.execute(`
      SELECT * FROM navigation_menus 
      WHERE is_active = 1 
      ORDER BY parent_id ASC, sort_order ASC
    `);

    // Chuyển đổi dữ liệu phẳng thành cấu trúc cây (đa cấp)
    return buildMenuTree(result.rows);
  } catch (error) {
    console.error('Failed to fetch navigation menus:', error);
    return [];
  }
}

function buildMenuTree(flatMenus: any[]) {
  const sortedMenus = [...flatMenus].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const map = new Map();
  const roots: any[] = [];

  sortedMenus.forEach(menu => {
    map.set(menu.id, { ...menu, items: [] });
  });

  sortedMenus.forEach(menu => {
    const node = map.get(menu.id);
    if (menu.parent_id === null || menu.parent_id === 0) {
      roots.push(node);
    } else {
      const parent = map.get(menu.parent_id);
      if (parent) {
        parent.items.push(node);
      }
    }
  });

  return roots;
}