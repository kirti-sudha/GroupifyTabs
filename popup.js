document.getElementById("groupTabsButton").addEventListener("click", groupTabsByDomain);
document.getElementById("ungroupAllButton").addEventListener("click", ungroupAllTabs);

async function groupTabsByDomain() {
    const tabs = await chrome.tabs.query({ url: ["https://*/*", "http://*/*"] });
    const uniqueMainDomains = Array.from(new Set(tabs.map(tab => getMainDomain(tab.url))));
    
    const groupTemplate = document.getElementById("group_template");
    const groupList = document.getElementById("groupList");
    groupList.innerHTML = "";

    for (const mainDomain of uniqueMainDomains) {
        const tabIds = tabs.filter(tab => getMainDomain(tab.url) === mainDomain).map(tab => tab.id);
        const group = await chrome.tabs.group({ tabIds });
        await chrome.tabGroups.update(group, { title: mainDomain, collapsed: true });

        const groupElement = groupTemplate.content.firstElementChild.cloneNode(true);
        groupElement.querySelector(".group-title").textContent = mainDomain;

        groupElement.querySelector(".group_button").addEventListener("click", async () => groupThisTab(mainDomain));
        groupElement.querySelector(".ungroup_button").addEventListener("click", async () => ungroupThisTab(mainDomain));

        groupList.appendChild(groupElement);
    }
}

async function ungroupAllTabs() {
    const groups = await chrome.tabGroups.query({});
    for (const group of groups) {
        const tabsInGroup = await chrome.tabs.query({ groupId: group.id });
        const tabIds = tabsInGroup.map(tab => tab.id);
        await chrome.tabs.ungroup(tabIds);
    }
}

async function groupThisTab(domain) {
    const tabs = await chrome.tabs.query({ url: ["https://*/*", "http://*/*"] });
    const tabIds = tabs.filter(tab => getMainDomain(tab.url) === domain).map(tab => tab.id);
    const group = await chrome.tabs.group({ tabIds });
    await chrome.tabGroups.update(group, { title: domain, collapsed: true });
}

async function ungroupThisTab(domain) {
    const tabs = await chrome.tabs.query({ url: ["https://*/*", "http://*/*"] });
    const tabIds = tabs.filter(tab => getMainDomain(tab.url) === domain).map(tab => tab.id);
    await chrome.tabs.ungroup(tabIds);
}

function getMainDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        const parts = hostname.split('.');
        const mainDomain = parts[parts.length - 2];// Return the second-to-last part as the main domain
        return mainDomain.charAt(0).toUpperCase() + mainDomain.substr(1).toLowerCase()
    } catch (error) {
        console.error('Error extracting main domain:', error);
        return null;
    }
}
