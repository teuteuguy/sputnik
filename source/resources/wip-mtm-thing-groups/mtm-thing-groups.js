const GROUP_NAMES = require('./thing-group-names.json');
const AWS = require('aws-sdk');
const iot = new AWS.Iot();
const _ = require('underscore');

// All MTM Groups will be prefixed with the Prefix set in the GROUP_NAMES file.
// This is a helper class for managing the groups and things.

class MTMThingGroups {
    constructor() {}

    createThingGroup(groupName, description, parentGroupName) {
        let params = {
            thingGroupName: GROUP_NAMES.PREFIX + groupName,
            thingGroupProperties: {
                thingGroupDescription: description,
                attributePayload: {
                    attributes: {
                        nbDevices: '0'
                    },
                    merge: false
                }
            }
        };
        if (parentGroupName) {
            params.parentGroupName = GROUP_NAMES.PREFIX + parentGroupName;
        }
        return iot.createThingGroup(params).promise();
    }

    init() {
        const _self = this;
        return Promise.all([
            _self.createThingGroup(GROUP_NAMES.MANAGED, 'Thing Group for My Things Management Managed Devices'),
            _self.createThingGroup(GROUP_NAMES.NON_MANAGED, 'Thing Group for My Things Management NOT Managed Devices')
        ]).then(results => {
            // console.log('Thing Groups created');
            // return _self.resetALLThingsToThingGroup(GROUP_NAMES.NON_MANAGED);
            return results;
        });
    }

    getMasterGroups() {
        return GROUP_NAMES;
    }


















    _isThingInGroup(tn, gn, nextToken) {
        const _self = this;
        return iot
            .listThingGroupsForThing({
                thingName: tn,
                maxResults: 100,
                nextToken: nextToken
            })
            .promise()
            .then(groupListForThing => {
                if (
                    _.findIndex(groupListForThing.thingGroups, group => {
                        return group.groupName === GROUP_NAMES.PREFIX + gn;
                    }) !== -1
                ) {
                    // Thing is already in the group !
                    console.log('_isThingInGroup', true);
                    return true;
                } else if (groupListForThing.nextToken) {
                    // There's more to check.
                    console.log('_isThingInGroup.recursing');
                    return _self._isThingInGroup(tn, gn, groupListForThing.nextToken);
                } else {
                    // Thing is not in the group.
                    console.log('_isThingInGroup', false);
                    return false;
                }
            });
    }

    getUnManagedGroup() {
        return GROUP_NAMES.NON_MANAGED;
    }



    addThingToThingGroup(thingName, groupName) {
        const _self = this;

        // Add Thing to MTM Group => increase the nbDevices attribute by 1.
        console.log('addThingToThingGroup(' + thingName + ', ' + groupName + ')');

        // First we need to recurse to get all the groups the thing is already in to check if thing is already part of this group ?
        // If so, no need to increase the nbDevices attribute for the given group.

        return _self._isThingInGroup(thingName, groupName).then(inGroup => {
            if (!inGroup) {
                // Thing is NOT in group => Let's add it.
                console.log('addThingToThingGroup: Thing is NOT in', groupName, 'adding it');
                return iot
                    .describeThingGroup({
                        thingGroupName: GROUP_NAMES.PREFIX + groupName
                    })
                    .promise()
                    .then(group => {
                        const nbDevices = parseInt(group.thingGroupProperties.attributePayload.attributes.nbDevices);

                        return iot
                            .addThingToThingGroup({
                                thingName: thingName,
                                thingGroupName: GROUP_NAMES.PREFIX + groupName
                            })
                            .promise()
                            .then(result => {
                                return iot
                                    .updateThingGroup({
                                        thingGroupName: GROUP_NAMES.PREFIX + groupName,
                                        thingGroupProperties: {
                                            attributePayload: {
                                                attributes: {
                                                    nbDevices: '' + (nbDevices + 1)
                                                }
                                            }
                                        }
                                    })
                                    .promise()
                                    .then(result => {
                                        console.log(
                                            'addThingToThingGroup: Group updated with nbDevices',
                                            nbDevices + 1
                                        );
                                        return;
                                    });
                            });
                    });
            } else {
                return;
            }
        });
    }

    // TODO: fix this because nextToken doesn't work.
    _listALLThingGroups(gName, nextToken, thingGroups) {
        const _self = this;

        console.log('_listALLThingGroups:', gName, nextToken, thingGroups);

        return iot
            .listThingGroups({
                maxResults: 100,
                namePrefixFilter: GROUP_NAMES.PREFIX,
                parentGroup: gName,
                nextToken: nextToken
            })
            .promise()
            .then(results => {
                console.log('_listALLThingGroups(' + gName + '): Listing:', results.thingGroups.length, 'childs');
                let newThingGroups = thingGroups.concat(
                    results.thingGroups.map(g => {
                        return {
                            childName: g.groupName
                        };
                    })
                );
                if (results.nextToken) {
                    return _self._listALLThingGroups(gName, results.nextToken, newThingGroups);
                } else {
                    console.log('_listALLThingGroups(' + gName + '): Done:', newThingGroups.length);
                    return newThingGroups;
                }
            });
    }

    deleteThingGroup(groupName) {
        const _self = this;
        let _childs;

        groupName = GROUP_NAMES.PREFIX + groupName;

        console.log('deleteThingGroup(' + groupName + '): Get Childs');
        return _self._listALLThingGroups(groupName, null, [])
            .then(childs => {
                _childs = childs;
                console.log('deleteThingGroup(' + groupName + '): Got', _childs.length, 'childs');
                return Promise.all(_childs.map(c => {
                    return _self._listALLThingGroups(c.childName, null, []).then(results => {
                        c.subChilds = results;
                        console.log(c.childName, c.subChilds.length);
                        return;
                    });
                }));
            })
            .then(results => {
                console.log('deleteThingGroup(' + groupName + '): Childs', _childs);
                return _childs;
            });

        // const params = {
        //     maxResults: 2,
        //     namePrefixFilter: GROUP_NAMES.PREFIX,
        //     parentGroup: groupName
        // };

        // console.log('deleteThingGroup(' + groupName + '):', 'recurse:', recurse);

        // let _thingGroups;

        // return iot.listThingGroups(params).promise().then(thingGroups => {
        //     _thingGroups = thingGroups.thingGroups;

        //     console.log('deleteThingGroup(' + groupName + '):', 'Found:', _thingGroups.length, 'child groups');
        //     console.log('deleteThingGroup(' + groupName + '):', JSON.stringify(_thingGroups, null, 2));

        //     if (_thingGroups.length === 0) {
        //         console.log('deleteThingGroup(' + groupName + '):', 'End of a branch: Deleting group:', groupName);
        //         return iot.deleteThingGroup({
        //             thingGroupName: groupName
        //         }).promise().then(result => {
        //             console.log('deleteThingGroup(' + groupName + '):', 'Deleted', groupName, result);
        //             return result;
        //         });
        //     } else {
        //         console.log('deleteThingGroup(' + groupName + '):', 'Following branch into:', _thingGroups[0].groupName);
        //         return _self.deleteThingGroup(_thingGroups[0].groupName, true).then(result => {
        //             console.log('deleteThingGroup(' + groupName + '):', 'Returned from deletion of:', _thingGroups[0].groupName);
        //             console.log('deleteThingGroup(' + groupName + '):', 'but there was at least initially', _thingGroups.length, 'childs we needed to delete');
        //             if (_thingGroups.length <= 1) {
        //                 console.log('deleteThingGroup(' + groupName + '): were done');
        //                 return result;
        //             } else {
        //                 console.log('deleteThingGroup(' + groupName + '): we need to rerun');
        //                 return (new Promise((resolve, reject) => {
        //                     setTimeout(() => {
        //                         resolve();
        //                         if (1 === 2) {
        //                             reject();
        //                         }
        //                     }, 1000);
        //                 })).then(() => {
        //                     _self.deleteThingGroup(groupName, true);
        //                 });
        //             }
        //         });
        //     }
        // });
    }

    deleteALLThingGroups() {
        const _self = this;
        return Promise.all([
            _self.deleteThingGroup(GROUP_NAMES.MANAGED),
            _self.deleteThingGroup(GROUP_NAMES.NON_MANAGED)
        ]).then(results => {
            return results;
        });
    }

    resetALLThingsToThingGroup(thingGroupName, nexttoken) {
        const _self = this;
        return Promise.all([
                iot
                .describeThingGroup({
                    thingGroupName: GROUP_NAMES.PREFIX + thingGroupName
                })
                .promise(),
                iot
                .listThings({
                    maxResults: 100,
                    nextToken: nexttoken
                })
                .promise()
            ])
            .then(results => {
                const nbDevices = parseInt(results[0].thingGroupProperties.attributePayload.attributes.nbDevices);
                const things = results[1];
                console.log('resetALLThingsToThingGroup.listThings', nbDevices, things.things.length, things.nextToken);
                let promises = [
                    nbDevices,
                    things.nextToken,
                    ...things.things.map(thing => {
                        return iot
                            .addThingToThingGroup({
                                thingGroupName: GROUP_NAMES.PREFIX + thingGroupName,
                                thingName: thing.thingName
                            })
                            .promise()
                            .then(result => {
                                console.log('resetALLThingsToThingGroup: Added', thing.thingName);
                                return;
                            });
                    })
                ];
                return Promise.all(promises);
            })
            .then(results => {
                const nbDevices = results[0];
                const nextToken = results[1];
                return Promise.all([
                    nextToken,
                    iot
                    .updateThingGroup({
                        thingGroupName: GROUP_NAMES.PREFIX + thingGroupName,
                        thingGroupProperties: {
                            attributePayload: {
                                attributes: {
                                    nbDevices: '' + (nbDevices + results.length - 2)
                                }
                            }
                        }
                    })
                    .promise()
                ]);
            })
            .then(results => {
                const nextToken = results[0];
                console.log('End of first recurse:', nextToken, results[1]);
                if (nextToken) {
                    return _self.resetALLThingsToThingGroup(thingGroupName, nextToken);
                }
            });
    }

    factoryReset(event, context, callback) {
        const _self = this;
        return _self
            .deleteALLThingGroups()
            .then(result => {
                return _self.init();
            })
            .then(result => {
                callback(null, null);
            })
            .catch(err => {
                callback(err, null);
            });
    }


    listThingsInThingGroup(thingGroupName, naxResults, nextToken) {
        return iot.listThingsInThingGroup({
            thingGroupName: GROUP_NAMES.PREFIX + thingGroupName,
            maxResults: naxResults,
            nextToken: nextToken,
            recursive: false
        }).promise();
    }
}

module.exports = MTMThingGroups;
