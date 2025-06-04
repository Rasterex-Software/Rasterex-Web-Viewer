import * as UIExtension from "UIExtension";
import tpmModuleLoader from "./addon.info.json";
import tabTemplate from "./templates/tab-template.art";
import CustomDialog from "./templates/custom-dialog.art";

import AddTextFieldStateHandler from './stateHandlers/addTextField'
let toolName = AddTextFieldStateHandler.getStateName();


export default class ExampleUIXAddon extends UIExtension.UIXAddon {
    /**
     * return addon's Name
     */
    static getName() {
        return "example";
    }
    /**
     * It's recommand not to modify this function.
     */
    static getLoader() {
        return tpmModuleLoader;
    }
    /**
     * init addon.
     */
    static init() {
        const module = UIExtension.modular.module("sample", []);
        //get registry instance.
        const registry = module.getRegistry();
        // param one is tag, not name
        registry.registerFragment("custom-dialog", {
            template: CustomDialog(),
            config:[{
                    //two buttons in template. All of them will bind this callback
                    target:"sample-close-button",
                    callback:function(){
                        /**
                         * @type {UIExtension.controllers.Controller}
                         */
                        let controller = this;
                        controller.getComponentByName("sample-dialog").hide();
                    }
                }
            ]
        });
    }
    fragments() {
        return [
            //append a fragment.
            {
                //name of target component. Using chrome's inspector to find their name.
                target: "template-container",
                action: UIExtension.UIConsts.FRAGMENT_ACTION.APPEND,
                template: `<sample:custom-dialog name="sample-dialog"/>`,
            },
            //append a toolbar tab.
            {
                //name of target component. If target component misses, all modification will fail.
                target: "toolbar-tabs",
                action: UIExtension.UIConsts.FRAGMENT_ACTION.APPEND,
                template: tabTemplate(),
            },
            {
                target: 'toolbar-tab-bodies',
                action: 'append',
                template: `<paddle name="fv--custom-tab-paddle">
                <group-list name="new-group-list">
                </group-list>
                </paddle>`
            },
            //append a single button. 
            {
                // this target is append in previous element. see tab-template.art
                target: "new-group-list", 
                action: UIExtension.UIConsts.FRAGMENT_ACTION.APPEND,
                template:
                    '<group @tooltip><create-textbox-button name="custom-control"></create-textbox-button></group>',
                config: {
                    target: "custom-control",
                    tooltip: {
                        title: "example:buttons.addText",
                    },
                    callback: class extends UIExtension.controllers.Controller {
                        postlink(){
                            let pdfui =this.getPDFUI();
                            this.registerPromise = pdfui.getStateHandlerManager().then(stateHandlerManager => {
                                stateHandlerManager.register(AddTextFieldStateHandler);
                                return stateHandlerManager;
                            });
                            // remove reference after destroy.
                            this.addDestroyHook(()=>this.registerPromise=null);
                            this.addDestroyHook(
                                pdfui.addViewerEventListener(UIExtension.PDFViewCtrl.ViewerEvents.switchStateHandler, (CurrentStateHandler, LastStateHandler) => {
                                    if(CurrentStateHandler.getStateName() === toolName) {
                                        this.component.element.classList.add('active');
                                    } else if(LastStateHandler.getStateName() === toolName) {
                                        this.component.element.classList.remove('active');
                                    }
                                })
                            );
                        }
                        // this function defines how to handle click event.
                        handle() {
                            return this.registerPromise.then(stateHandlerManager => {
                                let preStateName = stateHandlerManager.getCurrentStates().getStateName();
                                
                                if(preStateName !== toolName) {
                                    this.preStateName = preStateName;
                                    stateHandlerManager.switchTo(toolName);
                                } else {
                                    stateHandlerManager.switchTo(this.preStateName);
                                }
                            });
                        }
                    },
                },
            },
            //append a group list of button or something. 
            {
                target: "new-group-list",
                action: UIExtension.UIConsts.FRAGMENT_ACTION.APPEND,
                template: '<group name="new-custom-group" retain-count="1"></group>',
            },
            //append a button to group list.
            {
                target: "new-custom-group",
                action: UIExtension.UIConsts.FRAGMENT_ACTION.APPEND,
                template:
                    '<div name="show-layer-button" class="new-button fv__ui-button fv__icon-toolbar-loupe" @tooltip ></div>',
                config: {
                    target: "show-layer-button",
                    tooltip: {
                        title: "example:buttons.show-dialog",
                    },
                    callback: class extends UIExtension.controllers.Controller {
                        handle() {
                            // show dialog component registed on line 41
                            this.getComponentByName("sample-dialog").show();
                        }
                    },
                },
            }
        ];
    }
}
