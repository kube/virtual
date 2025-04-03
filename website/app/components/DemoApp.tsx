import type { VirtualServer } from "@kube/virtual";

type DemoAppProps = {
  virtualServer: VirtualServer;
};

export const DemoApp: React.FC<DemoAppProps> = ({ virtualServer }) => {
  return (
    <div>
      <h1>Hello</h1>
      <p>This is the demo app!</p>
    </div>
  );
};
