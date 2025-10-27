import Icon from "./Icon";

export default function Button({
  classType,
  iconName,
  label = "",
  title = "",
  type = "button",
  isDisabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      className={"btn btn-" + classType}
      title={title}
      disabled={isDisabled}
      {...props}
    >
      {iconName && (
        <Icon name={iconName} cssClass={label === "" ? undefined : "pe-2"} />
      )}
      {label}
    </button>
  );
}
