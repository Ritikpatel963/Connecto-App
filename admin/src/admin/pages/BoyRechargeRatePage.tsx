import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../components/PageHeader";
import { settingsApi } from "../api/settings";

const SETTING_KEY = "boy_coin_rate";

const BoyRechargeRatePage = () => {
  const queryClient = useQueryClient();
  const [rate, setRate] = useState<string>("");
  const [saved, setSaved] = useState(false);

  const { data: currentRate, isLoading } = useQuery({
    queryKey: ["settings", SETTING_KEY],
    queryFn: () => settingsApi.get(SETTING_KEY),
  });

  useEffect(() => {
    if (currentRate !== null && currentRate !== undefined) {
      setRate(String(currentRate));
    }
  }, [currentRate]);

  const mutation = useMutation({
    mutationFn: (value: number) => settingsApi.set(SETTING_KEY, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings", SETTING_KEY] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(rate);
    if (!parsed || parsed <= 0) return;
    mutation.mutate(parsed);
  };

  const rateNum = parseFloat(rate) || 0;
  const exampleRupees = 100;

  return (
    <div className="boy-recharge-rate-page">
      <PageHeader
        title="Recharge Rate"
        description="Set the rupees-to-coins conversion rate for boy recharge. This only affects how many coins a boy gets per rupee — not girl payouts."
        icon="solar:coin-outline"
      />

      <div className="row gy-4">
        <div className="col-lg-6">
          <div className="card shadow-none border h-100">
            <div className="card-header bg-neutral-50 border-bottom py-16 px-24">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="solar:settings-outline" className="text-2xl text-primary-600" />
                <h6 className="mb-0 text-lg">Conversion Rate</h6>
              </div>
            </div>
            <div className="card-body p-24">
              {isLoading ? (
                <div className="text-center py-4">
                  <Icon icon="eos-icons:loading" className="text-3xl text-primary-600" />
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      1 Rupee (INR) = ? Coins
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-neutral-50 fw-semibold">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        required
                        min="0.01"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        placeholder="e.g. 10"
                        id="boy-recharge-rate-input"
                      />
                      <span className="input-group-text bg-neutral-50 fw-semibold">Coins</span>
                    </div>
                    <div className="form-text text-secondary-light mt-2">
                      How many coins a boy receives per 1 Rupee recharged.
                    </div>
                  </div>

                  {rateNum > 0 && (
                    <div className="alert alert-primary d-flex align-items-center gap-3 mb-4 border-0 bg-primary-50 text-primary-600 rounded-3">
                      <Icon icon="solar:calculator-outline" className="text-2xl flex-shrink-0" />
                      <div>
                        <strong>₹{exampleRupees}</strong> = <strong>{(exampleRupees * rateNum).toFixed(0)} coins</strong>
                        <div className="text-sm opacity-75">Example recharge at this rate</div>
                      </div>
                    </div>
                  )}

                  <div className="d-flex align-items-center gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary d-inline-flex align-items-center gap-2"
                      disabled={mutation.isPending || !rate || rateNum <= 0}
                      id="save-boy-rate-btn"
                    >
                      {mutation.isPending
                        ? <><Icon icon="eos-icons:loading" /> Saving...</>
                        : <><Icon icon="solar:disk-outline" /> Save Rate</>
                      }
                    </button>
                    {saved && (
                      <span className="text-success d-flex align-items-center gap-1 text-sm fw-medium">
                        <Icon icon="solar:check-circle-bold" className="text-lg" /> Saved
                      </span>
                    )}
                    {mutation.isError && (
                      <span className="text-danger text-sm">{(mutation.error as Error).message}</span>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-none border h-100">
            <div className="card-header bg-neutral-50 border-bottom py-16 px-24">
              <div className="d-flex align-items-center gap-2">
                <Icon icon="solar:info-circle-outline" className="text-2xl text-primary-600" />
                <h6 className="mb-0 text-lg">How It Works</h6>
              </div>
            </div>
            <div className="card-body p-24">
              <ul className="list-unstyled d-flex flex-column gap-4 mb-0">
                <li className="d-flex gap-3">
                  <span className="badge bg-primary-50 text-primary-600 fw-bold flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>1</span>
                  <div>
                    <div className="fw-semibold text-neutral-800">Boy recharges wallet</div>
                    <div className="text-secondary-light text-sm mt-1">He pays in rupees via UPI / card / bank.</div>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <span className="badge bg-primary-50 text-primary-600 fw-bold flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>2</span>
                  <div>
                    <div className="fw-semibold text-neutral-800">Coins are credited</div>
                    <div className="text-secondary-light text-sm mt-1">Coins = Rupees × this rate.</div>
                  </div>
                </li>
                <li className="d-flex gap-3">
                  <span className="badge bg-primary-50 text-primary-600 fw-bold flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center" style={{ width: "32px", height: "32px" }}>3</span>
                  <div>
                    <div className="fw-semibold text-neutral-800">Formula</div>
                    <div className="text-secondary-light text-sm mt-1">
                      <code className="bg-neutral-50 px-2 py-1 rounded text-primary-600 border">coins = rupees × rate</code>
                      <div className="mt-2">Completely independent of girl payout packages.</div>
                    </div>
                  </div>
                </li>
              </ul>
              <hr className="my-4 border-neutral-200" />
              <div className="alert alert-warning mb-0 d-flex align-items-start gap-2 border-0 bg-warning-50 text-warning-600 rounded-3">
                <Icon icon="solar:danger-triangle-outline" className="text-xl flex-shrink-0 mt-1" />
                <div className="text-sm">
                  Changing this rate only affects <strong>new recharges</strong>. Past transactions are not recalculated.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoyRechargeRatePage;
