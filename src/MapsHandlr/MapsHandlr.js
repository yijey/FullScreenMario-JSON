/**
 * 
 */
function MapsHandlr(settings) {
    "use strict";
    if(!this || this === window) {
        return new MapsCreatr(settings);
    }
    var self = this,
        
        // MapsCreatr container for maps from which this obtains Thing settings
        MapsCreator,
        
        // MapScreenr container for map attributes, such as "floor" or "setting"
        MapScreener,
        
        // An Array of strings representing the names of attributes to be copied
        // to the MapScreener during self.setLocation
        screen_attributes,
        
        // The currently referenced map from MapsCreator, set by self.setMap
        map_current, 
        
        // The currently referenced area in a map, set by self.setLocation
        area_current,
        
        // The currently referenced location in an area, set by self.setLocation
        location_current,
        
        // The name of the currently edited map, set by self.setMap
        map_name,
        
        // The current area's array of prethings that are to be added in order
        // during self.spawnMap
        prethings,
        
        // When a prething needs to be spawned, this function should put it on
        // the map
        on_spawn,
        
        // Optionally, an array of Things to stretch across the map horizontally
        stretches,
        
        // If stretches exists, the function to call to add one to the map
        stretch_add,
        
        // If stretches exists, the function to call to stretch horizontally
        on_stretch,
        
        // Directional equivalents for converting from directions to keys
        directionKeys = {
            "xInc": "left",
            "xDec": "right",
            "yInc": "top",
            "yDec": "bottom"
        },
        
        // Opposite directions for when finding descending order Arrays
        directionOpposites = {
            "xInc": "xDec",
            "xDec": "xInc",
            "yInc": "yDec",
            "yDec": "yInc"
        };
    
    /**
     * 
     */
    self.reset = function reset(settings) {
        // Maps themselves should have been created in the MapsCreator object
        if(!settings.MapsCreator) {
            throw new Error("No MapsCreator provided to MapsHandlr.");
        }
        MapsCreator = settings.MapsCreator;
        
        // Map/Area attributes will need to be stored in a MapScreenr object
        if(!settings.MapScreener) {
            throw new Error("No MapScreener provided to MapsHandlr.");
        }
        MapScreener = settings.MapScreener;
        
        screen_attributes = settings.screen_attributes || [];
        
        on_spawn = settings.on_spawn || console.log.bind(console, "Spawning:");
        
        stretch_add = settings.stretch_add;
        on_stretch = settings.on_stretch;
    };
    
    
    /* Simple gets
    */
    
    /**
     * Simple getter for the MapsCreatr object that makes the actual maps.
     * 
     * @return {MapsCreatr}
     */
    self.getMapsCreator = function getMapsCreator() {
        return MapsCreator;
    };
    
    /**
     * Simple getter for the MapScreenr object where attributes are copied.
     * 
     * @return {MapScreenr}
     */
    self.getMapScreener = function getMapScreener() {
        return MapScreener;
    };
    
    /**
     * Simple getter for the Array of attribute names copied to the MapScreener.
     */
    self.getScreenAttributes = function getScreenAttributes() {
        return screen_attributes;
    };
    
    /**
     * Simple getter for the key by which the current map is located in 
     * the MapCreatr. This is typically a String.
     *
     * @return {Mixed}
     */
    self.getMapName = function getMapName() {
        return map_name;
    };
    
    /** 
     * Gets the map listed under the given name. If no name is provided, the
     * map_current is returned instead.
     * 
     * @param {Mixed} [name]   An optional key to find the map under. This will
     *                         typically be a String.
     * @return {Map}
     */
    self.getMap = function getMap(name) {
        if(arguments.length) {
            return MapsCreator.getMap(name);
        } else {
            return map_current;
        }
    };
    
    /**
     * Simple getter pipe to the internal MapsCreator.getMaps() function.
     * 
     * @return {Object}   An associative array of maps, keyed by their names.
     */
    self.getMaps = function getMaps() {
        return MapsCreator.getMaps();
    };
    
    /**
     * Simple getter function for the area_current object.
     * 
     * @return {Object} The current area object, included area attributes.
     */
    self.getArea = function getArea() {
        return area_current;
    };
    
    /**
     * Simple getter function for a location within the current area's map.
     * 
     * @reutrn {Object} The request location object.
     */
    self.getLocation = function (location) {
        return area_current.map.locations[location];
    }
    
    /**
     * Simple getter function for the internal prethings object. This will be
     * null before the first self.setMap.
     * 
     * return {Prething[]}   An array of the current area's Prethings.
     */
    self.getPreThings = function () {
        return prethings;
    }
    
    
    /* Map / location setting
    */
    
    /**
     * Sets the currently manipulated map in the handler to be the one under a
     * given name. Note that this will do very little unless a location is 
     * provided (this is by design - an EightBitter using this should set them
     * manually).
     * 
     * @param {Mixed} name   A key to find the map under. This will typically be
     *                       a String.
     * @param {Number} [location]   An optional number for a location to
     *                              immediately start the map in. 
     *                          
     */
    self.setMap = function setMap(name, location) {
        // Get the newly current map from self.getMap normally
        map_current = self.getMap(name);
        if(!map_current) {
            throw new Error("No map found under: " + name);
        }
        // If self.getMap threw an error (map not found), this won't be called
        map_name = name;
        
        // Most of the work is done by setLocation (by default, the map's first)
        if(arguments.length > 1) {
            self.setLocation(location);
        }
    };
    
    /**
     * Goes to a particular location in the given map. This is the primary,
     * meaty function for resetting attributes in the MapScreenr.
     * 
     * @param [mixed] location_number   The number of the location to start in.
     */
    self.setLocation = function setLocation(name) {
        var location, attribute, len, i;

        // Query the location from the current map and ensure it exists
        location = map_current.locations[name];
        if(!location) {
            throw new Error("Unknown location given: " + name);
        }
        
        // Since the location is valid, mark it as current (with its area)
        location_current = location;
        area_current = location.area;
        
        // Copy all the settings from that area into the MapScreenr container
        for(i = 0, len = screen_attributes.length; i < len; i += 1) {
            attribute = screen_attributes[i];
            MapScreener[attribute] = area_current[attribute];
        }
        
        // Reset the prethings object, enabling it to be used as a fresh start
        // for the new Area/Location placements
        prethings = MapsCreator.getPreThings(location);
        
        if(area_current.stretches) {
            setStretches(area_current.stretches);
        } else {
            stretches = undefined;
        }
    };
    
    /**
     * 
     */
    function setStretches(stretches_raw) {
        if(!stretches) {
            stretches = [];
        }
        
        stretches = stretches_raw.map(stretch_add);
    }
    
    /**
     * 
     * 
     * 
     */
    self.addPrethings = function (extras) {
        var extra, i;
        for(i = 0; i < extras.length; i += 1) {
            extra = extras[i];
            
            console.log("Adding", extra);
            
            // for example
            // analyzePreMacro(reference, prethings, area_current, map_current)
            // analyzePreThing(reference, prethings, area_current, map_current)
        }
    }
    
    /**
     * 
     * 
     * 
     * @todo This will almost certainly present problems when different 
     *       directions are used. For Pokemon/Zelda style games, the system
     *       will probably need to be adapted to use a Quadrants approach
     *       instead of plain Arrays.
     */
    self.spawnMap = function (direction, top, right, bottom, left) {
        if(!left && !right) {
            debugger;
        }
        var name, group, mid, start, end, i, prething;
        
        // For each group of PreThings currently able to spawn...
        for(name in prethings) {
            if(!prethings.hasOwnProperty(name)) {
                continue;
            }
            
            // Don't bother trying to spawn the group if it has no members
            group = prethings[name][direction];
            if(group.length === 0) {
                continue;
            }
            
            // Find the start and end points within the PreThings Array
            // Ex. if direction="xInc", go from .left >= left to .left <= right
            mid = (group.length / 2) | 0;
            start = findPreThingsSpawnStart(direction, group, mid, top, right, bottom, left);
            end = findPreThingsSpawnEnd(direction, group, mid, top, right, bottom, left);
            
            // Loop through all the directionally valid PreThings, spawning if they're
            // within the bounding box
            for(i = start; i <= end; i += 1) {
                prething = group[i];
                
                // This will have to be made relative to work for Pokemon/Zelda games...
                // if(
                    // prething.top > bottom
                    // || prething.right < left
                    // || prething.bottom < top
                    // || prething.left > right
                // ) {
                    // continue;
                // }
                
                on_spawn(prething);
            }
        }
    };
    
    
    /**
     * Warning: very inefficient! Should switch to binary search.
     */
    function findPreThingsSpawnStart(direction, group, i, top, right, bottom, left) {
        var directionKey = directionKeys[direction],
            directionEnd = getDirectionEnd(directionKey, top, right, bottom, left);
        
        for(var i = 0; i < group.length; i += 1) {
            if(group[i][directionKey] >= directionEnd) {
                return i;
            }
        }
        
        return i;
    }
    
    /**
     * Warning: very inefficient! Should switch to binary search.
     */
    function findPreThingsSpawnEnd(direction, group, i, top, right, bottom, left) {
        var directionKey = directionKeys[direction],
            directionKeyOpposite = directionKeys[directionOpposites[direction]],
            directionEnd = getDirectionEnd(directionKeyOpposite, top, right, bottom, left);
        
        for(var i = group.length - 1; i >= 0; i -= 1) {
            if(group[i][directionKey] <= directionEnd) {
                return i;
            }
        }
        
        return i;
    }
    
    /**
     * 
     */
    function getDirectionEnd(directionKey, top, right, bottom, left) {
        switch(directionKey) {
            case "top": 
                return top;
            case "right":
                return right;
            case "bottom":
                return bottom;
            case "left":
                return left;
        }
    }
    
    
    self.reset(settings || {});
}