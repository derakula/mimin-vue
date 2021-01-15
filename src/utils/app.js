/**
 * According to the route initialization menu
 * @param routes routing
 * @param filter filter
 * @returns {*} menu list
 */
export const createMenus = (routes, filter) => {
  const menus = [];
  if (filter) {
    routes = routes.filter((i) => filter(i));
  }
  routes.forEach((route) => {
    if (route.path === "/" && route.children) {
      createMenus(route.children).forEach((item) => {
        menus.push(item);
      });
    } else {
      let children;
      if (route.children) {
        children = createMenus(route.children);
      }

      const meta = route;
      menus.push({
        text: meta && meta.text ? meta.text : route.resourceName,
        icon: meta ? meta.icon : "",
        path: route.path,
        children,
      });
    }
  });

  return menus;
};

/**
 * Create a default top view
 * @param routes routing
 * @param filter filter
 */
export const createDefaultVisitedBar = (routes, filter, barArray = []) => {
  if (filter) {
    routes.filter((i) => filter(i));
  }
  routes.forEach((route) => {
    if (route.children) {
      createDefaultVisitedBar(route.children, null, barArray);
    } else {
      const meta = route.meta;
      if (meta && meta.defaultVisited) {
        barArray.push({
          name: meta && meta.text ? meta.text : route.name,
          path: route.path,
        });
      }
    }
  });
  return barArray;
};

/**
 * Array to tree structure
 * @param list source array
 * @param tree
 * @param parentId parent ID
 */
export const listToTree = (list, tree, parentId) => {
  //Assert the parent node
  function assertParentId(item, parentId) {
    if (parentId == null || parentId == undefined) {
      return item.parentId === null || item.parentId === undefined;
    } else {
      return item.parentId === parentId;
    }
  }
  list.forEach((item) => {
    // Determine whether it is the parent menu

    if (assertParentId(item, parentId)) {
      const child = {
        ...item,
        key: item.key || item.name,
        children: [],
      };
      // Iterate the list and find all submenus that match the current menu
      listToTree(list, child.children, item.id);
      // delete the attribute that does not have a children value
      if (child.children.length <= 0) {
        delete child.children;
      }
      // add to the tree
      tree.push(child);
    }
  });
};

/**
 *
 * Generate breadcrumbs based on the current route
 * @param {*} currentRoute current route
 * @param {*} breadcrumb collection returned by list
 * @param {*} index level subscript in reverse order
 */
export const createBreadCrumbs = (currentRoute, list = [], index = 0) => {
  if (currentRoute) {
    let text = currentRoute.meta
      ? currentRoute.meta.text
      : currentRoute.resourceName || currentRoute.name;
    list.push({
      text,
      disabled: index == 0 || currentRoute.path === null,
      href: currentRoute.path,
      index,
    });

    if (currentRoute.meta && currentRoute.meta.parent) {
      createBreadCrumbs(currentRoute.meta.parent, list, ++index);
    }
  }
  list.sort((o1, o2) => o2.index - o1.index);
  return list;
};