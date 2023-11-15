import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import Input from "sap/m/Input";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Event from "sap/ui/base/Event";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import Control from "sap/ui/core/Control";
import UI5Element from "sap/ui/core/Element";
import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import ODataModel from "sap/ui/model/odata/v4/ODataModel";
import Row from "sap/ui/table/Row";
import Table from "sap/ui/table/Table";
import ColorPickerDisplayMode from "sap/ui/unified/ColorPickerDisplayMode";
import ColorPickerPopover from "sap/ui/unified/ColorPickerPopover";
import { ColorPickerMode } from "sap/ui/unified/library";

/**
 * @namespace cap.app.controller
 */
export default class App extends Controller {
  rowContext: Context;
  mode: string;
  dataDialog: Promise<Control | Control[]>;
  view: View;

  public onInit(): void {}
  onAfterRendering(): void {
    this.view = this.getView()!;
  }
  public onCreate(): void {
    this.getOwnerComponent()?.setModel(
      new JSONModel({ ID: "", title: "", author_ID: "", stock: "" }),
      "data"
    );
    this.mode = "create";

    const that = this;
    if (!this.dataDialog) {
      this.dataDialog = Fragment.load({
        id: this.view.getId(),
        name: "cap.app.view.fragment.Data",
        controller: this,
      }).then(function (dialog: Control | Control[]) {
        that.view.addDependent(dialog as UI5Element);
        return dialog;
      });
    }

    this.dataDialog.then(function (dialog: Control | Control[]) {
      // opening the dialog
      (dialog as Dialog).open();
    });
  }

  public onDelete(event: Event): void {
    const rowContext = (
      (event.getSource() as Button).getParent() as Row
    ).getBindingContext() as Context;
    MessageBox.confirm("Are you sure you want to delete?", {
      onClose: (actionEvent: String) => {
        if (actionEvent === "OK")
          rowContext.delete().then(
            () => {},
            () => {}
          );
      },
    });
  }

  public onClose(event: Event): void {
    ((event.getSource() as Button).getParent() as Dialog).close();
  }
  private onCloseError(event: Event, err: any): void {
    this.onClose(event);
    BusyIndicator.hide();
    MessageBox.show(err);
  }
  public onSave(event: Event): void {
    const that = this;
    BusyIndicator.show();
    const books = (
      this.getOwnerComponent()?.getModel("data") as JSONModel
    ).getData();
    if (this.mode === "create") {
      books.ID = books.ID == "" ? null : books.ID;
      const context = (this.getOwnerComponent()?.getModel() as ODataModel)
        .bindList("/Books")
        .create(books);
      context.created()?.then(
        () => {
          MessageToast.show("Data has been saved");
          this.onClose(event);
          that.getOwnerComponent()?.getModel()?.refresh();
          BusyIndicator.hide();
        },
        (error) => {
          MessageBox.error("Unable to save the data");
          this.onClose(event);
          BusyIndicator.hide();
        }
      );
    } else {
      this.rowContext.setProperty("title", books.title).then(
        () => {
          this.rowContext
            .setProperty("ID", books.ID == "" ? null : books.ID)
            .then(
              () => {
                this.onClose(event);
                that.getOwnerComponent()?.getModel()?.refresh();
                BusyIndicator.hide();
                MessageToast.show("Data has been saved");
              },
              (err) => that.onCloseError(event, err)
            );
        },
        (err) => that.onCloseError(event, err)
      );
    }
  }

  public onUpdate(event: Event): void {
    this.rowContext = (
      (event.getSource() as Button).getParent() as Row
    ).getBindingContext() as Context;
    const rowObject = this.rowContext.getObject();
    this.getOwnerComponent()?.setModel(new JSONModel(rowObject), "data");
    this.mode = "update";

    const that = this;
    if (!this.dataDialog) {
      this.dataDialog = Fragment.load({
        id: this.view?.getId(),
        name: "cap.app.view.fragment.Data",
        controller: this,
      }).then(function (dialog: Control | Control[]) {
        that.view?.addDependent(dialog as UI5Element);
        return dialog;
      });
    }

    this.dataDialog.then(function (dialog: Control | Control[]) {
      // opening the dialog
      (dialog as Dialog).open();
    });
  }
}
