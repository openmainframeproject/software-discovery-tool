import React from 'react';

function FilterSidebar({
    osList,
    expandedOS,
    onToggleExpand,
    selectedVersions,
    onVersionToggle,
    refinePackageName,
    onRefineChange,
    onClearFilters
}) {
    return (
        <div className="filter-sidebar">
            <div className="refine-filters">
                <label>
                    Refine results on this page
                    <input
                        type="text"
                        value={refinePackageName}
                        onChange={(e) => onRefineChange(e.target.value)}
                        placeholder="Search within page..."
                        className="ml-2 p-1 border rounded"
                    />
                </label>
            </div>

            <div className="filter-distribution">
                <p className="filter-heading">Filter distribution</p>
                {Object.keys(osList).map((os) => (
                    <div key={os} className="distro-group">
                        <div
                            className="distro-group-header"
                            onClick={() => onToggleExpand(os)}
                        >
                            <span>{expandedOS[os] ? '▾' : '▸'}</span> {os}
                        </div>
                        {expandedOS[os] && (
                            <div className="distro-versions">
                                {Object.keys(osList[os]).map((version) => (
                                    <label key={version} className="version-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={!!(selectedVersions[os] && selectedVersions[os][version])}
                                            onChange={() => onVersionToggle(os, version)}
                                        />
                                        {version}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button className="clear-filters-btn" onClick={onClearFilters}>
                Clear filters
            </button>
        </div>
    );
}

export default FilterSidebar;